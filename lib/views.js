import { Meteor } from 'meteor/meteor';
import { Contracts } from '/imports/api/contracts/Contracts';

import { createDelegation } from '/imports/startup/both/modules/Contract';
import { gui, log, logUser, defaultSettings } from '/lib/const';
import { convertToSlug } from '/lib/utils';

const _views = {};
let _thread = [];


/**
* @summary gets a singature from given query terms
* @param {object} terms coming from view query
* @return {object} with signature
*/
const _getSignature = (terms) => {
  let signature;
  let userId;
  if ((terms.username && !terms.userId)) {
    userId = Meteor.users.findOne({ username: terms.username });
    if (userId) {
      signature = {
        _id: userId._id,
      };
    } else {
      signature = {
        username: terms.username,
      };
    }
  } else {
    signature = {
      _id: terms.userId,
    };
  }
  return signature;
};

/**
* @summary obtain applicant address
* @param {object} terms coming from view query
* @return {string} with address
*/
const _getApplicant = (terms) => {
  if (terms.username) {
    return terms.username;
  }
  if (terms.userId) {
    const user = Meteor.users.findOne({ _id: terms.userId });
    if (user) {
      return user.username;
    }
  }
  return '';
};

/**
* @summary given a view returns a query object
* @param {string} view for switch case
* @param {object} terms coming from view query
* @return {object} with query
*/
const _getQuery = (view, terms) => {
  switch (view) {
    case 'token':
      return { stage: { $ne: 'DRAFT' }, 'blockchain.coin.code': terms.token.toUpperCase() };
    case 'geo':
      return { stage: { $ne: 'DRAFT' }, geo: terms.country.toUpperCase() };
    case 'peer':
      return { stage: { $ne: 'DRAFT' }, kind: !terms.kind ? 'VOTE' : terms.kind, signatures: { $elemMatch: _getSignature(terms) } };
    case 'period':
      return { stage: { $ne: 'DRAFT' }, kind: { $ne: 'DELEGATION' }, period: terms.period.toUpperCase(), pollId: { $exists: false } };
    case 'latest':
    default:
      return { stage: { $ne: 'DRAFT' }, kind: { $ne: 'DELEGATION' } };
  }
};


/**
* @summary gets all the children of a root in a tree for threads
* @param {object} root starting point
* @return {array} list with children ids
*/
const _mapTree = (root) => {
  let list = [];
  let sublist = [];
  list.push(root._id);
  const query = { $or: [{ _id: root._id }, { replyId: root._id }, { pollId: root._id }] };
  const children = Contracts.find(query).fetch();
  for (let i = 0; i < children.length; i += 1) {
    list.push(children[i]._id);
  }
  _thread.push(..._.uniq(list));
  for (let j = 0; j < list.length; j += 1) {
    if (list[j] !== root._id) {
      sublist = _mapTree(Contracts.findOne({ _id: list[j] }));
    }
  }
  _thread.push(...sublist);
  list = _.union(list, sublist);
  return list;
};

const _isParent = (contract) => {
  return !contract.replyId;
};

/**
* @summary given any contract, find the root contract of the thread where it belongs
* @param {object} contract filters and limits
* @return {object} query to use on collection
*/
const _getRootContract = (contract) => {
  let parent = contract;
  while (!_isParent(parent)) {
    parent = Contracts.findOne({ _id: parent.replyId });
  }

  return parent;
};

/**
* @summary returns a list with id of all threaded contracts
* @param {object} contract
*/
const _getThread = (contract) => {
  _thread = [];
  const rootContract = _getRootContract(contract);
  _mapTree(rootContract);
  return _.uniq(_thread);
};

/**
* @summary display contracts ordered by latest date
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.latest = (terms) => {
  log(`{ view: 'latest', user: ${logUser()}, terms: ${JSON.stringify(terms)} }`);
  let query;
  if (Meteor.settings.public.app.config.interface && Meteor.settings.public.app.config.interface.mainFeed && Meteor.settings.public.app.config.interface.mainFeed.onlyParentPosts) {
    query = { stage: { $ne: 'DRAFT' }, kind: { $ne: 'DELEGATION' }, pollId: { $exists: false }, replyId: { $exists: false } };
  } else {
    query = { stage: { $ne: 'DRAFT' }, kind: { $ne: 'DELEGATION' }, pollId: { $exists: false } };
  }
  return {
    find: query,
    options: { sort: { timestamp: -1 }, limit: terms.limit, skip: terms.skip },
  };
};

/**
* @summary display contracts based on current period status
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.period = (terms) => {
  log(`{ view: 'period', user: ${logUser()}, period: '${terms.period.toUpperCase()}' }`);
  const query = { stage: { $ne: 'DRAFT' }, kind: { $ne: 'DELEGATION' }, period: terms.period.toUpperCase(), pollId: { $exists: false } };
  return {
    find: query,
    options: { sort: { timestamp: -1 }, limit: terms.limit, skip: terms.skip },
  };
};

/**
* @summary display contracts ordered by latest date
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.linkedFeed = (terms) => {
  log(`{ view: 'linkedFeed', user: ${logUser()}, subview: '${terms.subview}', terms: ${JSON.stringify(terms)} }`);
  const finalQuery = Object.assign(_getQuery(terms.subview, terms), { timestamp: { $lt: new Date(terms.lastItem) } });
  return {
    find: finalQuery,
    options: { sort: { timestamp: -1 }, limit: terms.limit, skip: 0 },
  };
};

/**
* @summary display delegation contracts
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.peer = (terms) => {
  log(`{ view: 'peer', user: ${logUser()} }`);
  return {
    find: { stage: { $ne: 'DRAFT' }, kind: !terms.kind ? 'VOTE' : terms.kind, $or: [{ signatures: { $elemMatch: _getSignature(terms) } }, { 'decision.applicant': _getApplicant(terms) }] },
    options: { sort: { lastUpdate: -1 }, limit: terms.limit, skip: terms.skip },
  };
};

/**
* @summary a specific post given a keyword
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.post = (terms) => {
  log(`{ view: 'post', user: ${logUser()}, ${terms.keyword ? `keyword: '${terms.keyword}'` : `url: '${terms.url}'`} }`);
  if (terms.keyword) {
    return {
      find: { stage: { $ne: 'DRAFT' }, keyword: terms.keyword },
      options: { sort: { lastUpdate: -1 } },
    };
  } else if (terms.url) {
    return {
      find: { stage: { $ne: 'DRAFT' }, url: terms.url },
      options: { sort: { lastUpdate: -1 } },
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary transactions related to a specific contract
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.votes = (terms) => {
  let contractId;
  if (!terms.contractId && terms.keyword) {
    contractId = Contracts.findOne({ keyword: terms.keyword })._id;
  } else {
    contractId = terms.contractId;
  }
  log(`{ view: 'votes', user: ${logUser()}, contractId: '${contractId}' }`);
  if (contractId) {
    return {
      find: { contractId },
      options: { sort: terms.sort },
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary replies to a specific post
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.replies = (terms) => {
  let contractId;
  let contract;

  if (!terms.contractId && terms.keyword) {
    contract = Contracts.findOne({ keyword: terms.keyword });
    contractId = contract._id;
  } else {
    contract = Contracts.findOne({ _id: terms.contractId });
    contractId = terms.contractId;
  }

  log(`{ view: 'replies', user: ${logUser()}, contractId: '${contractId}' }`);

  if (contractId) {
    return {
      find: { replyId: contractId },
      options: { sort: terms.sort },
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary whole thread connected to any given post including root and all childs
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.thread = (terms) => {
  let contract;

  // get contract referred for view
  if (terms.url) {
    contract = Contracts.findOne({ url: terms.url });
  } else if (!terms.contractId && terms.keyword) {
    contract = Contracts.findOne({ keyword: terms.keyword });
  } else {
    contract = Contracts.findOne({ _id: terms.contractId });
  }

  if (contract) {
    const thread = _getThread(contract);
    const query = [];

    for (let i = 0; i < thread.length; i += 1) {
      query.push({ _id: thread[i] }, { replyId: thread[i] });
    }

    if (contract.pollId) {
      query.push({ _id: contract.pollId });
    }

    log(`{ view: 'thread', user: ${logUser()}, contractId: '${contract._id}', threadLength: ${thread.length} }`);

    if (query.length > 0) {
      return {
        find: { $or: query },
        options: {},
      };
    }
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};


/**
* @summary all transactions related to a thread
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.threadVotes = (terms) => {
  let contract;

  // get contract referred for view
  if (!terms.contractId && terms.keyword) {
    contract = Contracts.findOne({ keyword: terms.keyword });
  } else {
    contract = Contracts.findOne({ _id: terms.contractId });
  }

  const thread = _getThread(contract);

  const query = [];
  for (let i = 0; i < thread.length; i += 1) {
    const entities = [{ 'output.entityId': thread[i] }, { 'input.entityId': thread[i] }, { 'output.delegateId': thread[i] }, { 'input.delegateId': thread[i] }];
    query.push({ $or: [{ contractId: thread[i] }, { $or: entities }] });
  }

  log(`{ view: 'threadVotes', user: ${logUser()}, contractId: '${contract._id}', threadLength: ${thread.length} }`);

  if (query.length > 0) {
    return {
      find: { $or: query },
      options: {},
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary all transactions related to a period
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.periodVotes = (terms) => {
  const contracts = Contracts.find({ period: terms.period.toUpperCase() }).fetch();

  let thread = [];
  for (let k = 0; k < contracts.length; k += 1) {
    thread.push(contracts[k]._id);
  }
  thread = _.uniq(thread);

  const query = [];
  for (let i = 0; i < thread.length; i += 1) {
    query.push({ contractId: thread[i] });
  }

  log(`{ view: 'periodVotes', user: ${logUser()}, period: '${terms.period}', pollLength: ${thread.length} }`);

  const options = {
    limit: (terms.limit) ? terms.limit : gui.LIMIT_TRANSACTIONS_PER_LEDGER,
    skip: (terms.skip) ? terms.skip : 0,
    sort: (terms.sort) ? terms.sort : -1,
  };

  if (query.length > 0) {
    return {
      find: { $or: query },
      options,
    };
  }
  return {
    options,
  };
};


/**
* @summary transactions on a specific contract from a user
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.userVotes = (terms) => {
  let contractId;
  if (!terms.userId && terms.username) {
    contractId = Meteor.users.findOne({ username: terms.username })._id;
  } else {
    contractId = terms.userId;
  }
  log(`{ view: 'userVotes', user: ${logUser()}, contractId: '${contractId}' }`);
  if (contractId) {
    return {
      find: { kind: 'VOTE', $or: [{ 'output.entityId': contractId }, { 'input.entityId': contractId }, { 'output.delegateId': contractId }, { 'input.delegateId': contractId }] },
      options: { sort: terms.sort },
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary a general view of the latest activity
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.lastVotes = (terms) => {
  log(`{ view: 'lastVotes', user: ${logUser()} }`);
  return {
    find: { stage: { $ne: 'DRAFT' }, kind: { $ne: 'DELEGATION' } },
    options: {
      limit: (terms.limit) ? terms.limit : gui.LIMIT_TRANSACTIONS_PER_LEDGER,
      skip: (terms.skip) ? terms.skip : 0,
      sort: (terms.sort) ? terms.sort : -1,
    },
  };
};

/**
* @summary a general view of the latest activity
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.transactionsToken = (terms) => {
  log(`{ view: 'transactionsToken', user: ${logUser()}, token: '${terms.token.toUpperCase()}' }`);
  return {
    find: { 'blockchain.coin.code': terms.token.toUpperCase() },
    options: { limit: 25, sort: terms.sort },
  };
};

/**
* @summary latest activity by country
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.transactionsGeo = (terms) => {
  log(`{ view: 'transactionsGeo', user: ${logUser()}, geo: '${terms.country.toUpperCase()}' }`);
  return {
    find: { geo: terms.country.toUpperCase() },
    options: { limit: 25, sort: terms.sort },
  };
};

/**
* @summary latest activity by peer
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.transactionsPeer = (terms) => {
  let contractId;
  if (!terms.userId && terms.username) {
    contractId = Meteor.users.findOne({ username: terms.username })._id;
  } else {
    contractId = terms.userId;
  }
  log(`{ view: 'transactionsPeer', user: ${logUser()}, contractId: '${contractId}' }`);
  return {
    find: { $or: [{ 'output.entityId': contractId }, { 'input.entityId': contractId }, { 'output.delegateId': contractId }, { 'input.delegateId': contractId }] },
    options: { limit: 25, sort: terms.sort },
  };
};

/**
* @summary all the delegation related votes of a user
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.delegationVotes = (terms) => {
  let contractId;
  if (!terms.userId && terms.username) {
    contractId = Meteor.users.findOne({ username: terms.username })._id;
  } else {
    contractId = terms.userId;
  }

  log(`{ view: 'delegationVotes', user: ${logUser()}, contractId: '${contractId}' }`);

  if (contractId) {
    return {
      find: { kind: 'DELEGATION', $or: [{ 'output.delegateId': contractId }, { 'input.delegateId': contractId }] },
      options: { sort: terms.sort },
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};


/**
* @summary contracts filtered by a hashtag
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.tag = (terms) => {
  log(`{ view: 'tag', user: ${logUser()}, tag: '${terms.tag}}' }`);
  if (terms.tag) {
    return {
      find: { stage: { $ne: 'DRAFT' }, title: { $regex: `#${terms.tag}` } },
      options: { sort: { lastUpdate: -1 }, limit: terms.limit, skip: terms.skip },
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary contracts filtered by blockchain token
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.token = (terms) => {
  log(`{ view: 'token', user: ${logUser()}, token: '${terms.token}}' }`);
  if (terms.token) {
    return {
      find: _getQuery('token', terms),
      options: { sort: terms.sort, limit: terms.limit, skip: terms.skip, period: terms.period.toUpperCase() },
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary contracts filtered by blockchain token
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.wholeList = () => {
  log(`{ view: 'wholeList', user: ${logUser()} }`);
  return {
    find: {},
    options: {},
  };
};

/**
* @summary contracts filtered by geographical keyword
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.geo = (terms) => {
  log(`{ view: 'geo', user: ${logUser()}, country: '${terms.country}' }`);
  if (terms.country) {
    return {
      find: _getQuery('geo', terms),
      options: { sort: { lastUpdate: -1 }, limit: terms.limit, skip: terms.skip },
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary contracts that are in a poll
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.poll = (terms) => {
  log(`{ view: 'poll', user: ${logUser()}, pollId: '${terms.pollId}' }`);
  if (terms.pollId) {
    return {
      find: { pollId: terms.pollId },
      options: { sort: { pollChoiceId: -1 } },
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary contracts that are in a poll
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.pollList = (terms) => {
  log(`{ view: 'pollList', user: ${logUser()}, poll: ${JSON.stringify(terms.poll)} }`);
  if (terms.poll.length > 0) {
    const query = [];
    for (const i in terms.poll) {
      query.push({ _id: terms.poll[i].contractId });
    }
    return {
      find: { $or: query },
      options: { sort: { pollChoiceId: -1 } },
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary a contract
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.contract = (terms) => {
  log(`{ view: 'contract', user: ${logUser()}, contractId: ${terms.contractId} }`);
  if (terms.contractId) {
    return {
      find: { _id: terms.contractId },
      options: {},
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary a contract by the given kewyword referrer
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.contractByKeyword = (terms) => {
  log(`{ view: 'contractByKeyword', user: ${logUser()}, keyword: '${terms.keyword}' }`);
  if (terms.keyword) {
    return {
      find: { keyword: terms.keyword },
      options: {},
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary delegation only contracts
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.delegationContracts = () => {
  log(`{ view: 'delegationContracts', user: ${logUser()} }`);
  if (Meteor.user()) {
    return {
      find: { $and: [{ signatures: { $elemMatch: { _id: Meteor.userId() } } }, { kind: 'DELEGATION' }] },
      options: {},
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary delegation agreement between two parties
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.bothDelegationContracts = (terms) => {
  if (Meteor.user() && (Meteor.userId() !== terms.delegateId)) {
    const query = { $and: [{ signatures: { $elemMatch: { _id: Meteor.userId() } } }, { signatures: { $elemMatch: { _id: terms.delegateId } } }, { kind: 'DELEGATION' }] };
    const delegations = Contracts.find(query).fetch();
    const delegateName = Meteor.users.findOne({ _id: terms.delegateId }).username;

    log(`{ view: 'bothDelegationContracts', user: ${Meteor.user().username}, delegateId: ${terms.delegateId} }`);
    if (delegations.length === 0 || (delegations.length === 1 && delegations[0].signatures[0]._id === terms.delegateId)) {
      defaultSettings.delegations.title = `${convertToSlug(Meteor.user().username)}-${convertToSlug(delegateName)}`;
      defaultSettings.delegations.signatures = [{ username: Meteor.user().username }, { username: delegateName }];
      createDelegation(Meteor.userId(), terms.delegateId, defaultSettings.delegations);
      log(`log: 'Delegation contract created from ${Meteor.user().username} to ${delegateName}', `);
    }
    if (delegations.length === 0 || (delegations.length === 1 && delegations[0].signatures[0]._id === Meteor.userId())) {
      defaultSettings.delegations.title = `${convertToSlug(delegateName)}-${convertToSlug(Meteor.user().username)}`;
      defaultSettings.delegations.signatures = [{ username: delegateName }, { username: Meteor.user().username }];
      createDelegation(terms.delegateId, Meteor.userId(), defaultSettings.delegations);
      log(`log: 'Delegation contract created from ${delegateName} to ${Meteor.user().username}' }`);
    }
    return {
      find: query,
      options: {},
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary user specific transactions
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.userTransactions = () => {
  log(`{ view: 'userTransactions', user: ${logUser()} }`);
  if (Meteor.user()) {
    return {
      find: { $or: [{ 'output.entityId': Meteor.userId() }, { 'input.entityId': Meteor.userId() }] },
      options: {},
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary user specific transactions related to delegations
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.delegationTransactions = (terms) => {
  const query = [];
  for (const i in terms.items) {
    query.push({ $and: [{ 'output.entityId': terms.items[i] }, { kind: 'DELEGATION' }] });
    query.push({ $and: [{ 'input.entityId': terms.items[i] }, { kind: 'DELEGATION' }] });
    query.push({ $and: [{ 'output.delegateId': terms.items[i] }, { kind: 'DELEGATION' }] });
    query.push({ $and: [{ 'input.delegateId': terms.items[i] }, { kind: 'DELEGATION' }] });
  }
  log(`{ view: 'delegationTransactions', user: ${logUser()} }`);
  if (query.length > 0) {
    return {
      find: { $or: query },
      options: {},
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary lists all the delegates of a given user profile
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.delegateList = (terms) => {
  const query = [];
  for (const i in terms.items) {
    query.push({ _id: terms.items[i] });
  }
  log(`{ view: 'delegateList', user: ${logUser()} }`);
  if (query.length > 0) {
    return {
      find: { $or: query },
      options: {},
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary votes from a user to a contract
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.singleVote = (terms) => {
  log(`{ view: 'singleVote', user: ${logUser()} }`);
  if (Meteor.user()) {
    return {
      find: { $or: [{ $and: [{ 'output.entityId': Meteor.userId() }, { 'input.entityId': terms.contractId }] },
        { $and: [{ 'input.entityId': Meteor.userId() }, { 'output.entityId': terms.contractId }] }] },
      options: {},
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary all transactions related to a contract
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.contractVotes = (terms) => {
  log(`{ view: 'contractVotes', user: ${logUser()}, contractId: '${terms.contractId}' }`);
  if (terms.contractId) {
    return {
      find: { $or: [{ 'output.entityId': terms.contractId }, { 'input.entityId': terms.contractId }] },
      options: {},
    };
  }
  return {
    find: {},
    options: { limit: 1 },
  };
};

/**
* @summary all the daos listed in this server
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.daoList = () => {
  log(`{ view: 'daoList', user: ${logUser()} }`);
  return {
    find: { 'profile.blockchain.isDAO': true },
    options: {},
  };
};

/**
* @summary creates a query for a publication
* @param {object} terms includes settings to create the db query
*/
const _query = (terms) => {
  const viewFunction = _views[terms.view];
  const parameters = viewFunction(terms);

  if (parameters) {
    if (parameters.limit > gui.ITEMS_PER_PAGE) {
      parameters.limit = gui.ITEMS_PER_PAGE;
    }

    return parameters;
  }
  return undefined;
};

export const views = _views;
export const query = _query;
