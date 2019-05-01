import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';

import { convertToSlug, convertToUsername } from '/lib/utils';
import { defaultConstituency } from '/lib/const';
import { Contracts } from '/imports/api/contracts/Contracts';
import { shortUUID } from '/imports/startup/both/modules/crypto';
import { transact } from '/imports/api/transactions/transaction';
import { token } from '/lib/token';
import { geo } from '/lib/geo';

/**
* @summary signs a contract with a verified user
* @param {string} contractId - contract Id to be signed
* @param {string} userObject - object containing profile of the user signing
* @param {string} role - type of role required in this signature
* NOTE: simplify this and don't store a cache of data of a user, that was a stupid idea.
*/
const _sign = (contractId, userObject, userRole) => {
  let found = false;
  const contract = Contracts.findOne({ _id: contractId });

  // avoids signature duplication
  if (contract.signatures) {
    contract.signatures.forEach((item) => {
      if (item._id === userObject._id) {
        found = true;
        return;
      }
    });
  }

  // signs
  if (!found) {
    Contracts.update({ _id: contractId }, { $push: {
      signatures:
      {
        _id: userObject._id,
        role: userRole,
        username: userObject.username,
        status: 'CONFIRMED',
      },
    } });
  }
};

/**
* @summary dynamically generates a valid URL keyword regardless the case
* @param {string} keyword tentative title being used for contract
*/
const _contractURI = (keyword) => {
  const MAXLENGTH = 30;
  const alphanumeric = keyword.replace(/[^\w\s]/gi, '');
  return convertToSlug(`${alphanumeric.substring(0, MAXLENGTH).slice(-1) === '-' ? alphanumeric.substring(0, MAXLENGTH - 1) : alphanumeric.substring(0, MAXLENGTH)}-${shortUUID()}`);
};

/**
* @summary gets public address of a given token from a user
* @param {string} contractToken ticker
*/
const _getPublicAddress = (contractToken) => {
  const reserves = Meteor.user().profile.wallet.reserves;
  const chain = {
    coin: { code: '' },
    publicAddress: '',
  };

  if (reserves && reserves.length > 0) {
    for (let k = 0; k < reserves.length; k += 1) {
      if (reserves[k].token === contractToken) {
        chain.coin.code = contractToken;
        chain.publicAddress = reserves[k].publicAddress;
        for (let j = 0; j < token.coin.length; j += 1) {
          if (token.coin[j].code === contractToken && token.coin[j].blockchain === 'ETHEREUM') {
            chain.votePrice = token.coin[j].defaultVote;
            chain.coin.code = token.coin[j].code;
            break;
          }
        }
        return chain;
      }
    }
  }
  for (let j = 0; j < token.coin.length; j += 1) {
    if (token.coin[j].code === contractToken && token.coin[j].blockchain === 'ETHEREUM') {
      const defaultBlockchain = _getPublicAddress('WEI');
      defaultBlockchain.coin.code = contractToken;
      return defaultBlockchain;
    }
  }
  return undefined;
};


/**
* @summary sets corresponding blockchain address to contract
* @param {object} draft new contract
*/
const _entangle = (draft) => {
  const constituency = draft.constituency;
  if (!constituency.length) {
    return _getPublicAddress('WEI');
  }
  for (let i = 0; i < constituency.length; i += 1) {
    if (constituency[i].kind === 'TOKEN') {
      return _getPublicAddress(constituency[i].code);
    }
  }

  return draft;
};

/**
* @summary checks if contract has a basic token
* @param {object} contract - contract to check
*/
const _contractHasToken = (contract) => {
  if (contract.constituency.length > 0) {
    for (let i = 0; i < contract.constituency.length; i += 1) {
      if (contract.constituency[i].kind === 'TOKEN') {
        return true;
      }
    }
  }
  return false;
};

const _webVoteChain = (contract) => {
  const draft = contract;

  draft.blockchain = {
    coin: { code: 'WEB VOTE' },
    votePrice: '1',
  };
  draft.constituency = [{
    kind: 'TOKEN',
    code: 'WEB VOTE',
    check: 'EQUAL',
  }];

  return draft;
};

const _blockstackChain = (contract) => {
  const draft = contract;

  draft.blockchain = {
    coin: { code: 'STX' },
    publicAddress: Meteor.user().profile.wallet.reserves[0].publicAddress,
    votePrice: '1',
  };
  draft.constituency = [{
    kind: 'TOKEN',
    code: 'STX',
    check: 'EQUAL',
  }];
  draft.wallet.currency = 'STX';

  return draft;
};

const _ethereumChain = (contract) => {
  const draft = contract;
  // ERC20 tokens
  if (!_contractHasToken(draft)) {
    draft.constituency.push(defaultConstituency);
  }
  for (let i = 0; i < draft.constituency.length; i += 1) {
    if (draft.constituency[i].kind === 'TOKEN') {
      draft.wallet.currency = draft.constituency[i].code;
    }
  }

  if (draft.blockchain.coin === undefined) {
    // set coin.code to whats in wallet.currency
    draft.blockchain.coin = {};
    draft.blockchain.coin.code = draft.wallet.currency;
  } else {
    draft.blockchain.coin.code = draft.wallet.currency;
  }

  return draft;
};

/**
* @summary inserts default blockchain data to a contract
* @param {object} contract contract to include chain data
*/
const _chain = (contract) => {
  let draft = contract;

  if (draft.wallet.currency === 'WEB VOTE') {
    draft = _webVoteChain(draft);
  } else if (draft.wallet.currency === 'STX') {
    draft = _blockstackChain(draft);
  } else {
    draft = _ethereumChain(draft);
  }
  return draft;
};

/**
* @summary generate a new empty draft
* @param {string} keyword - name of the contract to be specifically used for this delegation
* @param {string} title - title of the contract without slug
* @return {object} contract - if it's empty then call router with new contract,
* otherwise returns contract object from db
*/
const _createContract = (newkeyword, newtitle) => {
  // empty Contract
  if (newkeyword === undefined) {
    if (!Contracts.findOne({ keyword: `draft-${Meteor.userId()}` })) {
      Contracts.insert({ keyword: `draft-${Meteor.userId()}` });
    }
    const contract = Contracts.findOne({ keyword: `draft-${Meteor.userId()}` });
    if (Meteor.user()) {
      // sign by author
      _sign(contract._id, Meteor.user(), 'AUTHOR');

      // chain by author
      const chainedContract = _chain(contract);
      Contracts.update({ _id: contract._id }, { $set: {
        blockchain: chainedContract.blockchain,
        wallet: chainedContract.wallet,
        constituency: chainedContract.constituency,
      } });
    }
    return Contracts.findOne({ keyword: `draft-${Meteor.userId()}` });
  // has title & keyword, used for forks
  } else if (!Contracts.findOne({ keyword: newkeyword })) {
    if (!newtitle) {
      Contracts.insert({ keyword: newkeyword });
    } else {
      Contracts.insert({ keyword: newkeyword, title: newtitle });
    }
    return Contracts.findOne({ keyword: newkeyword });
  }
  return false;
};

/**
* @summary saves poll on database
* @param {object} draft being checked for poll creation.
* @param {object} pollContract poll data
*/
const _savePoll = (draft, pollContract) => {
  // update db
  Contracts.update({ _id: pollContract._id }, {
    $set: {
      blockchain: draft.blockchain,
      constituency: draft.constituency,
      constituencyEnabled: draft.constituencyEnabled,
      rules: draft.rules,
      wallet: draft.wallet,
      kind: pollContract.kind,
      pollId: pollContract.pollId,
      pollChoiceId: pollContract.pollChoiceId,
      signatures: draft.signatures,
      closing: draft.closing,
      stage: 'LIVE',
    },
  });
};

/**
* @summary removes all poll contracts
* @param {object} draft being checked for poll erasure
*/
const _removePoll = (draft) => { 
  for (let k = 0; k < draft.poll.length; k += 1) {
    Contracts.remove({ _id: draft.poll[k].contractId });
  }
};

/**
* @summary create a basic poll inside a contract
* @param {object} draft being checked for poll creation.
* @return {object} draft created with poll settings included
*/
const _createPoll = (draft) => {
  let pollContract;
  const newDraft = draft;

  // is a draft configured for polling without a poll
  if (draft.rules && draft.rules.pollVoting === true) {
    if (draft.poll.length === 0) {
      const options = [];
      let pollContractURI;
      for (let i = 0; i < 2; i += 1) {
        // creaate uri reference
        pollContractURI = _contractURI(`${TAPi18n.__('poll-choice').replace('{{number}}', i.toString())} ${document.getElementById('titleContent').innerText} ${TAPi18n.__(`poll-default-title-${i}`)}`);

        // create contract to be used as poll option
        pollContract = _createContract(pollContractURI, TAPi18n.__(`poll-default-title-${i}`));

        // attach id of parent contract to poll option contract
        pollContract.pollId = draft._id;
        pollContract.kind = 'POLL';
        pollContract.pollChoiceId = i;

        _savePoll(draft, pollContract);

        // add to array to be stored in parent contract
        options.push({
          contractId: pollContract._id,
          totalStaked: '0',
        });
      }

      // store array in parent contract
      newDraft.poll = options;

      return newDraft;
    } else if (draft.poll.length > 0) {
      // change info of existing poll

      _removePoll(draft);
      newDraft.poll = [];
      newDraft.poll = _createPoll(newDraft).poll;
      return newDraft;
    }
  }

  // return same draft
  return draft;
};


/**
* @summary verifies if there's already a precedent among delegator and delegate
* @param {string} delegatorId - identity assigning the tokens (usually currentUser)
* @param {string} delegateId - identity that will get a request to approve
*/
const _getDelegationContract = (delegatorId, delegateId) => {
  const contract = Contracts.findOne({ _id: delegateId });
  if (contract) {
    if (contract.kind === 'DELEGATION') {
      return contract;
    }
  } else {
    const delegationContract = Contracts.findOne({
      // $and: [{ signatures: { $elemMatch: { _id: delegatorId } } }, { signatures: { $elemMatch: { _id: delegateId } } }, { kind: 'DELEGATION' }] });
      'signatures.0._id': delegatorId, 'signatures.1._id': delegateId }); // || Contracts.findOne({ 'signatures.0._id': delegateId, 'signatures.1._id': delegatorId });
    if (delegationContract !== undefined) {
      return delegationContract;
    }
  }
  return false;
};

/**
* @summary updates the status of the signatures in the contract
* @param {string} status the status code to save in the contract signature
*/
const _updateContractSignatures = (status) => {
  const signatures = Session.get('contract').signatures;
  for (const signer in signatures) {
    if (signatures[signer]._id === Meteor.user()._id) {
      switch (signatures[signer].status) {
        case 'PENDING':
          if (status !== undefined) {
            signatures[signer].status = status;
            break;
          }
          signatures[signer].status = 'CONFIRMED';
          break;
        default:
          break;
      }
    }
  }
  Contracts.update(Session.get('contract')._id, { $set: { signatures } });
};

/**
* @summary sends the votes from a delegator to be put on hold until delegate approves deal.
* @param {string} source - identity assigning the tokens (usually currentUser)
* @param {string} target - identity that will get a request to approve
* @param {number} quantity - amount of votes being used
* @param {object} conditions - specified conditions for this delegation
*/
const _sendDelegation = (sourceId, targetId, quantity, conditions, newStatus) => {
  /*
    Meteor.call('executeTransaction', sourceId, targetId, quantity, conditions, newStatus, function (err, result) {
    if (err) {
      throw new Meteor.Error(err, '[_sendDelegation]: transaction failed.');
    } else {
      // update contract status\
      _updateContractSignatures(result);
    }
  });*/

  console.log(`sourceId ${sourceId},
    targetId ${targetId},
    quantity ${quantity},
    conditions ${conditions},
    newStatus ${newStatus}`
  );

  const txId = transact(sourceId, targetId, quantity, conditions);
  if (newStatus !== undefined && txId !== undefined) {
    _updateContractSignatures(newStatus);
  }
};

/**
* @summary generate delegation contract between two identities.
* @param {string} delegatorId - identity assigning the tokens (usually currentUser)
* @param {string} delegateId - identity that will get a request to approve
* @param {object} settings - additional settings to be stored on the ledger
*/
const _newDelegation = (delegatorId, delegateId, settings) => {
  let finalTitle;
  console.log(_getDelegationContract(delegatorId, delegateId));
  if (_getDelegationContract(delegatorId, delegateId)) { return false; }

  // creates new delegation contract
  if (!Contracts.findOne({ keyword: settings.title })) {
    // uses given title
    finalTitle = settings.title;
  } else {
    // adds random if coincidence among people with similar names happened
    finalTitle = settings.title + shortUUID();
  }

  const newDelegation =
    {
      keyword: finalTitle,
      title: TAPi18n.__('delegation-voting-rights'),
      kind: 'DELEGATION',
      stage: 'LIVE',
      description: TAPi18n.__('default-delegation-contract'),
      signatures: [
        {
          _id: delegatorId,
          username: settings.signatures[0].username,
          role: 'DELEGATOR',
          status: 'CONFIRMED',
        },
        {
          _id: delegateId,
          username: settings.signatures[1].username,
          role: 'DELEGATE',
          status: 'CONFIRMED',
        },
      ],
    };

  const newContract = Contracts.insert(newDelegation);
  return Contracts.findOne({ _id: newContract });
};

/**
* @summary verifies status of signature from identity in a contract
* @param {object} signatures - object containing signatures
* @param {object} signerId - identity of signer to verify
* @param {boolean} getStatus - if boolean value shall be returned rather than string
*/
const _signatureStatus = (signatures, signerId, getStatus) => {
  let label = String();
  let i = 0;
  for (i = 0; i < signatures.length; i += 1) {
    if (signatures[i]._id === signerId) {
      switch (signatures[i].role) {
        case 'DELEGATOR':
          label = TAPi18n.__('delegator');
          break;
        case 'DELEGATE':
          label = TAPi18n.__('delegate');
          break;
        default:
          if (Meteor.Device.isPhone()) {
            label = `<a id="removeSignature">${TAPi18n.__('remove')}</a>`;
          } else {
            label = TAPi18n.__('author');
          }
      }
      switch (signatures[i].status) {
        case 'PENDING':
          label += ` ${TAPi18n.__('signature-pending')}`;
          break;
        case 'REJECTED':
          label += ` ${TAPi18n.__('signature-rejected')}`;
          break;
        default:
          break;
      }
      break;
    }
  }
  if (getStatus === undefined || getStatus === false) {
    return label;
  } else if (signatures.length > 0) {
    if (signatures[i] !== undefined) {
      return signatures[i].status;
    }
    return false;
  }
  return false;
};

/**
* @summary removes a contract from db
* @param {string} contractId - id of the contract to remove
*/
const _remove = (contractId) => {
  Contracts.remove({ _id: contractId });
  // remove any reference to this in other contract ballots
  let newballot = [];
  const forks = Contracts.find(
    {
      collectiveId: Meteor.settings.public.Collective._id,
      ballot: { $elemMatch: { _id: contractId } },
    }).fetch();

  for (const i in forks) {
    newballot = undefined;
    for (const k in forks[i].ballot) {
      if (forks[i].ballot[k]._id === contractId) {
        forks[i].ballot.splice(k, 1);
        newballot = forks[i].ballot;
        break;
      }
    }
    if (newballot !== undefined) {
      Contracts.update({ _id: forks[i]._id }, { $set: { ballot: newballot } });
    }
  }
};

/**
* @summary generates a uri based on date
* @param {object} draft contract
*/
const _getURLDate = (draft) => {
  let time = Session.get('time');
  if (!time) {
    time = draft.createdAt;
  }
  return `/${time.getFullYear()}/${parseInt(time.getMonth() + 1, 10)}/${time.getDate()}/`;
};

/**
* @summary sums replies to parent and whole tree
* @param {object} contract being replied
*/
const _sumReplies = (contract) => {
  const reply = contract;

  if (reply.totalReplies) {
    reply.totalReplies += 1;
  } else {
    reply.totalReplies = 1;
  }

  Contracts.update({ _id: reply._id }, { $set: { totalReplies: reply.totalReplies } });

  const parent = Contracts.findOne({ _id: reply.replyId });
  if (parent) {
    _sumReplies(parent);
  }
};

/**
* @summary connects the contract to a physical jurisdcition
* @param {object} draft being legally bounded
*/
const _land = (draft) => {
  let land = '';
  if (draft.constituency.length > 0) {
    for (let i = 0; i < draft.constituency.length; i += 1) {
      if (draft.constituency[i].kind === 'NATION') {
        land = draft.constituency[i].code;
        break;
      }
    }
  }
  if (!land) {
    if (Meteor.user() && Meteor.user().profile &&
        Meteor.user().profile.country && Meteor.user().profile.country.code) {
      const countryCode = _.where(geo.country, { code: Meteor.user().profile.country.code })[0].code;
      if (countryCode) {
        land = countryCode;
      }
    }
  }
  return land;
};



/**
* @summary publishes a contract and goes to home
* @param {string} contractId - id of the contract to publish
* @param {string} keyword - key word identifier
*/
const _publish = (contractId, keyword) => {
  let draft = Session.get('draftContract');
  // status
  draft.stage = 'LIVE';

  // readable identifier
  if (!keyword) {
    draft.keyword = _contractURI(document.getElementById('titleContent').innerText, draft._id);
  } else {
    draft.keyword = keyword;
  }
  draft.url = `${_getURLDate(draft)}${draft.keyword}`;

  // jurisdiction
  draft.geo = _land(draft);

  // ballot
  if (draft.ballotEnabled) {
    const template = [
      {
        executive: true,
        mode: 'AUTHORIZE',
        _id: '1',
        tick: false,
      },
      {
        executive: true,
        mode: 'REJECT',
        _id: '0',
        tick: false,
      },
    ];
    draft.ballot = template;
  }

  // chain
  draft = _chain(draft);

  // db
  Contracts.update({ _id: contractId }, { $set: {
    stage: draft.stage,
    title: draft.title,
    keyword: draft.keyword,
    url: draft.url,
    ballotEnabled: draft.ballotEnabled,
    replyId: draft.replyId,
    geo: draft.geo,
    ballot: draft.ballot,
    constituencyEnabled: draft.constituencyEnabled,
    constituency: draft.constituency,
    wallet: draft.wallet,
    blockchain: draft.blockchain,
    rules: draft.rules,
    poll: draft.poll,
    closing: draft.closing,
  },
  });

  // add reply to counter in contract
  if (draft.replyId) {
    // count
    const reply = Contracts.findOne({ _id: draft.replyId });

    _sumReplies(reply);

    // notify
    let story;
    let toId;
    let fromId;
    let transaction;

    for (const i in reply.signatures) {
      story = 'REPLY';
      toId = reply.signatures[i]._id;
      fromId = Meteor.userId();
      transaction = { contractId: draft.replyId, reply: draft.title };

      Meteor.call(
        'sendNotification',
        toId,
        fromId,
        story,
        transaction, function (err, result) {
          if (err) {
            throw new Meteor.Error(err, '[sendNotification]: notification failed.');
          }
          return result;
        });
    }
  }
};

/**
* @summary removes a signature from a contract
* @param {string} contractId - contract Id to be signed
* @param {string} userId - user signature to remove.
****/
const _removeSignature = (contractId, userId) => {
  Contracts.update({ _id: contractId }, { $pull: {
    signatures: {
      _id: userId,
    },
  } });
};

const _rightToVote = (contract) => {
  if (contract.kind === 'DELEGATION') {
    for (const i in contract.signatures) {
      if (contract.signatures[i]._id === Meteor.user()._id) {
        return true;
      }
    }
    return false;
  }
  return true;
};

export const entangle = _entangle;
export const contractURI = _contractURI;
export const rightToVote = _rightToVote;
export const signatureStatus = _signatureStatus;
export const signContract = _sign;
export const removeSignature = _removeSignature;
export const publishContract = _publish;
export const removeContract = _remove;
export const createDelegation = _newDelegation;
export const getURLDate = _getURLDate;
export const sendDelegationVotes = _sendDelegation;
export const createPoll = _createPoll;
export const removePoll = _removePoll;
export const createContract = _createContract;
export const getDelegationContract = _getDelegationContract;
