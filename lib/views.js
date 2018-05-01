import { Meteor } from 'meteor/meteor';
import { Contracts } from '/imports/api/contracts/Contracts';

import { createDelegation } from '/imports/startup/both/modules/Contract';
import { gui, log, defaultSettings } from '/lib/const';
import { convertToSlug } from '/lib/utils';

const _views = {};

/**
* @summary display contracts ordered by latest date
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.latest = (terms) => {
  return {
    find: { collectiveId: Meteor.settings.public.Collective._id, stage: { $ne: 'DRAFT' }, kind: { $ne: 'DELEGATION' } },
    options: { sort: { lastUpdate: -1 }, limit: terms.limit, skip: terms.skip },
  };
};

/**
* @summary display delegation contracts
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.peer = (terms) => {
  let userId;
  let signature;
  let kind;
  if (!terms.kind) {
    kind = 'VOTE';
  } else {
    kind = terms.kind;
  }
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
  return {
    find: { collectiveId: Meteor.settings.public.Collective._id, stage: { $ne: 'DRAFT' }, kind, signatures: { $elemMatch: signature } },
    options: { sort: { lastUpdate: -1 }, limit: terms.limit, skip: terms.skip },
  };
};

/**
* @summary a specific post given a keyword
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.post = (terms) => {
  return {
    find: { collectiveId: Meteor.settings.public.Collective._id, stage: { $ne: 'DRAFT' }, keyword: terms.keyword },
    options: { sort: { lastUpdate: -1 } },
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
  return {
    find: { contractId },
    options: { sort: terms.sort },
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
  return {
    find: { kind: 'VOTE', $or: [{ 'output.entityId': contractId }, { 'input.entityId': contractId }] },
    options: { sort: terms.sort },
  };
};

/**
* @summary contracts filtered by a hashtag
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.tag = (terms) => {
  return {
    find: { collectiveId: Meteor.settings.public.Collective._id, stage: { $ne: 'DRAFT' }, title: { $regex: `.*/tag/${terms.tag}.*` } },
    options: { sort: { lastUpdate: -1 }, limit: terms.limit, skip: terms.skip },
  };
};

/**
* @summary a contract
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.contract = (terms) => {
  if (Meteor.user()) {
    return {
      find: { _id: terms.contractId },
      options: {},
    };
  }
  return undefined;
};

/**
* @summary a contract by the given kewyword referrer
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.contractByKeyword = (terms) => {
  if (Meteor.user()) {
    return {
      find: { keyword: terms.keyword },
      options: {},
    };
  }
  return undefined;
};

/**
* @summary delegation only contracts
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.delegationContracts = () => {
  if (Meteor.user()) {
    return {
      find: { $and: [{ signatures: { $elemMatch: { _id: Meteor.userId() } } }, { kind: 'DELEGATION' }] },
      options: {},
    };
  }
  return undefined;
};

/**
* @summary delegation agreement between two parties
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.bothDelegationContracts = (terms) => {
  if (Meteor.user()) {
    const query = { $and: [{ signatures: { $elemMatch: { _id: Meteor.userId() } } }, { signatures: { $elemMatch: { _id: terms.delegateId } } }, { kind: 'DELEGATION' }] };
    if (Contracts.find(query).fetch().length === 0) {
      log(`{ view: 'bothDelegationContracts', user: ${Meteor.user().username}, delegateId: ${terms.delegateId}, `);
      const delegateName = Meteor.users.findOne({ _id: terms.delegateId }).username;

      defaultSettings.delegations.title = `${convertToSlug(Meteor.user().username)}-${convertToSlug(delegateName)}`;
      defaultSettings.delegations.signatures = [{ username: Meteor.user().username }, { username: delegateName }];
      createDelegation(Meteor.userId(), terms.delegateId, defaultSettings.delegations);
      log(`log: 'Delegation contract created from ${Meteor.user().username} to ${delegateName}', `);

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
  return undefined;
};

/**
* @summary user specific transactions
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.userTransactions = () => {
  return {
    find: { $or: [{ 'output.entityId': Meteor.userId() }, { 'input.entityId': Meteor.userId() }] },
    options: {},
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
  return {
    find: { $or: query },
    options: {},
  };
};

/**
* @summary votes from a user to a contract
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.singleVote = (terms) => {
  return {
    find: { $or: [{ $and: [{ 'output.entityId': Meteor.userId() }, { 'input.entityId': terms.contractId }] },
                  { $and: [{ 'input.entityId': Meteor.userId() }, { 'output.entityId': terms.contractId }] }] },
    options: {},
  };
};

/**
* @summary all transactions related to a contract
* @param {object} terms filters and limits
* @return {object} query to use on collection
*/
_views.contractVotes = (terms) => {
  return {
    find: { $or: [{ 'output.entityId': terms.contractId }, { 'input.entityId': terms.contractId }] },
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
