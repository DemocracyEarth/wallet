import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { rules } from '/lib/const';
import { BigNumber } from 'bignumber.js';

import { displayNotice } from '/imports/ui/modules/notice';
import { Contracts } from '/imports/api/contracts/Contracts';
import { Collectives } from '/imports/api/collectives/Collectives';
import { guidGenerator } from '/imports/startup/both/modules/crypto';
import { getTime } from '/imports/api/time';
import { Transactions } from '/imports/api/transactions/Transactions';
import { getTotalVoters } from '/imports/ui/modules/ballot';
import { notify } from '/imports/api/notifier/notifier';
import { getWeiBalance, getTokenData } from '/imports/api/blockchain/modules/web3Util';
import { smallNumber } from '/imports/api/blockchain/modules/web3Util.js';

/**
* @summary looks at what type of entity (collective or individual) doing transaction
* @return {string} entityType - a string with constant of entity type
*/
const _getEntityType = (entityId) => {
  if (Meteor.users.findOne({ _id: entityId })) {
    return 'INDIVIDUAL';
  } else if (Collectives.findOne({ _id: entityId })) {
    return 'COLLECTIVE';
  } else if (Contracts.findOne({ _id: entityId })) {
    return 'CONTRACT';
  }
  return 'UNKNOWN';
};

/**
* @summary returns the has for the address that is from corresponding collective
* @param {array} address - a wallet from a user containing all directions
* @param {string} collectiveId - matching collective
***/
const _getAddressHash = (address, collectiveId) => {
  for (let i = 0; i < address.length; i += 1) {
    if (address[i].collectiveId === collectiveId) {
      return address[i].hash;
    }
  }
  return false;
};

/**
* @summary generates a new address specific to the collective running this instance
* @return {object} object - returns an object containing a new hash and this collective Id.
*/
const _getCollectiveAddress = () => {
  const collective = {
    hash: guidGenerator(),
    collectiveId: Meteor.settings.public.Collective._id,
  };
  return collective;
};

/**
* @summary generates a new address given a wallet
* @param {object} wallet - a wallet from a user containing all directions
***/
const _generateWalletAddress = (wallet) => {
  wallet.address.push(_getCollectiveAddress());
  return wallet;
};

/**
* @summary looks for an appropiate address to use for this user
* @param {string} entityId - id of the user's wallet being used
* @return {string} hash - a string with a wallet address direction for a user
***/
const _getWalletAddress = (entityId) => {
  const entityType = _getEntityType(entityId);
  let user;
  let wallet;

  switch (entityType) {
    case 'INDIVIDUAL': {
      user = Meteor.users.findOne({ _id: entityId });
      break;
    }
    case 'COLLECTIVE': {
      user = Collectives.findOne({ _id: entityId });
      break;
    }
    case 'CONTRACT': {
      user = Contracts.findOne({ _id: entityId });
      break;
    }
    default:
      // ERROR: entityId ${entityId} could not be found.
      return false;
  }

  if (user.profile !== undefined) {
    wallet = user.profile.wallet;
  } else {
    wallet = user.wallet; // entity is a contract
  }
  const collectiveId = Meteor.settings.public.Collective._id;

  if (wallet.address !== undefined && wallet.address.length > 0) {
    // entity wallet already has an address.
    return _getAddressHash(wallet.address, collectiveId);
  }

  // generating a new address for this collective...
  wallet = _generateWalletAddress(wallet);

  switch (entityType) {
    case 'INDIVIDUAL':
      user.profile.wallet = wallet;
      Meteor.users.update({ _id: entityId }, { $set: { profile: user.profile } });
      break;
    case 'COLLECTIVE':
      user.profile.wallet = wallet;
      Collectives.update({ _id: entityId }, { $set: { profile: user.profile } });
      break;
    case 'CONTRACT':
      Contracts.update({ _id: entityId }, { $set: { wallet } });
      break;
    default:
      return false;
  }
  return _getAddressHash(wallet.address, collectiveId);
};

/**
* @summary returns the profile object of an entity from a transaction
* @param {string} transactionSignal - input or output of a transaction object
* @return {object} profile - profile object of entity
*/
const _getProfile = (transactionSignal) => {
  switch (transactionSignal.entityType) {
    case 'INDIVIDUAL':
      return Meteor.users.findOne({ _id: transactionSignal.entityId }).profile;
    case 'COLLECTIVE':
      return Collectives.findOne({ _id: transactionSignal.entityId }).profile;
    case 'CONTRACT':
    default:
      return Contracts.findOne({ _id: transactionSignal.entityId });
  }
};

/**
* updates wallet object of an individual or collective
* @param {string} entityId - entity
* @param {string} entityType -  individual or collective
* @param {object} profileSettings - profile settings
*/
const _updateWallet = (entityId, entityType, profileSettings) => {
  switch (entityType) {
    case 'INDIVIDUAL':
      Meteor.users.update({ _id: entityId }, { $set: { profile: profileSettings } });
      break;
    case 'COLLECTIVE':
      Collectives.update({ _id: entityId }, { $set: { profile: profileSettings } });
      break;
    default: // 'CONTRACT'
      Contracts.update({ _id: entityId }, { $set: { wallet: profileSettings.wallet } });
      break;
  }
};

/**
* @summary gets array with all the transactions of a given user with a contract
* @param {string} userId - userId to be checked
* @param {string} contractId - contractId to be checked
*/
const _getTransactions = (userId, contractId) => {
 // const tx = Transactions.find({ $and: [{ $or: [{ 'output.entityId': userId }, { 'input.entityId': userId }] }, { contractId }] }, { sort: { timestamp: -1 } }).fetch();
 //  return tx;

  return _.sortBy(
    _.union(
      _.filter(Transactions.find({ 'input.entityId': userId }).fetch(), (item) => { return (item.output.entityId === contractId); }, 0),
      _.filter(Transactions.find({ 'output.entityId': userId }).fetch(), (item) => { return (item.input.entityId === contractId); }, 0)),
      'timestamp');
};

/**
* @summary basic criteria to count votes on transaction records
* @param {object} ticket specific ticket containing transaction info
* @param {string} entityId the entity having votes counterPartyId
*/
const _voteCount = (ticket, entityId) => {
  if (ticket.input.entityId === entityId) {
    return ticket.input.quantity;
  } else if (ticket.output.entityId === entityId) {
    return 0 - ticket.output.quantity;
  }
  return 0;
};

/**
* @summary gets the quantity of votes a given user has on a ledger
* @param {object} contractId - contractId to be checked
* @param {object} userId - userId to be checked
* @return {number} total vote count
*/
const _getVotes = (contractId, userId) => {
  // getting tally
  const contract = Contracts.findOne({ _id: contractId });

  if (contract && contract.tally !== undefined && contract.tally.voter.length > 0) {
    for (const i in contract.tally.voter) {
      if (contract.tally.voter[i]._id === userId) {
        return contract.tally.voter[i].votes;
      }
    }
  } else {
    // counting from ledger
  /*  const transactions = _getTransactions(userId, contractId);
    if (transactions.length > 1) {
      console.log('sale de else');
      return _.reduce(transactions, (memo, num, index) => {
        if (index === 1) {
          return _voteCount(memo, userId) + _voteCount(num, userId);
        }
        return memo + _voteCount(num, userId);
      });
    } else if (transactions.length === 1) {
      console.log('sale de tx');
      return _voteCount(transactions[0], userId);
    }*/
  }
  return 0;
};

/**
* @summary returns how many tokens where previously transacted
* @param {object} wallet - wallet ledger to be analyzed
* @param {string} creditorId - creditor to whom verify from
* @param {string} type - 'OUTPUT', 'INPUT'
* @return {number} delta - difference between input & output
*/
const _debt = (wallet, creditorId, type) => {
  let totals = 0;
  const transactions = _getTransactions(wallet, creditorId);

  for (const i in transactions) {
    if (transactions[i][type].entityId === creditorId) {
      totals += transactions[i][type].quantity;
    }
  }
  return totals;
};

/**
* @summary returns tokens from sender that used to belong to receiver
* @param {number} quantity - votes requested
* @param {number} totals - max present in ledger
*/
const _restoredTokens = (quantity, totals) => {
  if (quantity > totals) {
    return totals;
  }
  return quantity;
};

const _transactionMessage = (code) => {
  switch (code) {
    case 'INSUFFICIENT':
      displayNotice('not-enough-funds', true);
      return false;
    case 'INVALID':
      displayNotice('invalid-transaction', true);
      return false;
    case true:
    default:
      return true;
  }
};

/**
* @summary executes incoming or outgoing payment in a wallet
* @param {object} wallet the wallet being processed
* @param {string} mode OUTPUT, INPUT, blue outlook and jack to jack.
* @param {object} transaction containing specific transaction details
* @param {number} quantity the amount of dough.
*/
const _pay = (wallet, mode, transaction, quantity) => {
  const _wallet = wallet;
  switch (mode) {
    case 'INPUT':
      _wallet.placed += parseInt(quantity, 10);
      _wallet.available = parseInt(_wallet.balance - _wallet.placed, 10);
      _wallet.balance = parseInt(_wallet.placed + _wallet.available, 10);
      break;
    case 'RETRIEVE':
      _wallet.available += parseInt(0 - quantity, 10);
      _wallet.balance = parseInt(_wallet.placed + _wallet.available, 10);
      break;
    case 'DELEGATE':
      _wallet.available += parseInt(quantity, 10);
      _wallet.balance = parseInt(_wallet.placed + _wallet.available, 10);
      break;
    case 'OUTPUT':
    default:
      _wallet.available += parseInt(quantity, 10);
      _wallet.placed = parseInt(_wallet.placed - _restoredTokens(quantity, _debt(transaction.output.entityId, transaction.input.entityId, 'output')), 10);
      _wallet.balance = parseInt(_wallet.placed + _wallet.available, 10);
      break;
  }
  return Object.assign(wallet, _wallet);
};

/**
* @summary get info of delegate that is not party listed in transaction info
* @param {string} delegationId delegation contract to work with
* @param {string} counterPartyId who we are NOT searching for in delegation
*/
const _getDelegate = (delegationId, counterPartyId) => {
  const delegation = Contracts.findOne({ _id: delegationId });
  for (const i in delegation.signatures) {
    if (delegation.signatures[i]._id !== counterPartyId) {
      return Meteor.users.findOne({ _id: delegation.signatures[i]._id });
    }
  }
  return undefined;
};

/**
* @summary updates wallet of individual that is part of delegation contract
* @param {object} transaction - ticket with transaction impacting individual.
*/
const _processDelegation = (transaction) => {
  let delegate;
  if (transaction.input.entityType === 'INDIVIDUAL' && transaction.output.entityType === 'CONTRACT') {
    // outgoing
    delegate = _getDelegate(transaction.output.entityId, transaction.input.entityId);
    if (delegate) {
      delegate.profile.wallet = _pay(delegate.profile.wallet, 'DELEGATE', transaction, transaction.output.quantity);
    }
  } else if (transaction.input.entityType === 'CONTRACT' && transaction.output.entityType === 'INDIVIDUAL') {
    // incoming
    delegate = _getDelegate(transaction.input.entityId, transaction.output.entityId);
    if (delegate) {
      delegate.profile.wallet = _pay(delegate.profile.wallet, 'RETRIEVE', transaction, transaction.input.quantity);
    }
  }
  if (delegate) {
    _updateWallet(delegate._id, 'INDIVIDUAL', delegate.profile);
  }
};

/**
* @summary processes de transaction after insert and updates wallet of involved parties
* @param {string} txId - transaction identificator
* @param {string} success - INSUFFICIENT,
*/
const _processTransaction = (ticket) => {
  const txId = ticket;
  const transaction = Transactions.findOne({ _id: txId });
  const senderProfile = _getProfile(transaction.input);
  const receiverProfile = _getProfile(transaction.output);

  // verify transaction
  if (senderProfile.wallet.available < transaction.input.quantity) {
    return 'INSUFFICIENT';
  } else if (transaction.input.entityId === transaction.output.entityId) {
    return 'INVALID';
  }

  // transact
  senderProfile.wallet = _pay(senderProfile.wallet, 'INPUT', transaction, transaction.input.quantity);
  receiverProfile.wallet = _pay(receiverProfile.wallet, 'OUTPUT', transaction, transaction.output.quantity);

  // update wallets
  _updateWallet(transaction.input.entityId, transaction.input.entityType, senderProfile);
  _updateWallet(transaction.output.entityId, transaction.output.entityType, receiverProfile);

  // delegation
  if (transaction.kind === 'DELEGATION') {
    _processDelegation(transaction);
  }

  // set this transaction as processed
  return Transactions.update({ _id: txId }, { $set: { status: 'CONFIRMED' } });
};

/**
* @summary gets time from server
*/
const getTimestamp = () => {
  if (Meteor.isClient) {
    return Session.get('time');
  }
  return getTime();
};

/**
* @summary gets the id of a user for a given delegation transaction Participants
* @param {string} entityId the id whether contract or user
* @param {boolean} getSender if sender or receiver
*/
const _getDelegateId = (senderId, receiverId, getSender, kind) => {
  let entityId;
  if (kind === 'DELEGATION') {
    if (getSender) {
      entityId = senderId;
    } else {
      entityId = receiverId;
    }
    const user = Meteor.users.findOne({ _id: entityId });
    if (user) {
      return user._id;
    }
    const contract = Contracts.findOne({ _id: entityId });
    if (contract) {
      if (getSender) {
        if (receiverId === contract.signatures[0]._id) {
          return contract.signatures[1]._id;
        }
        return contract.signatures[0]._id;
      }
      if (senderId === contract.signatures[0]._id) {
        return contract.signatures[1]._id;
      }
      return contract.signatures[0]._id;
    }
  }
  return undefined;
};

/**
* @summary adds the transaction id to a stack to prevent double processing
* @param {string} transactionId the id of the transaction
* @return {boolean} if it is included or not in the stack already
*/
const _processedTx = (transactionId) => {
  const list = Session.get('txList');
  if (!list) {
    Session.set('txList', [transactionId]);
    return false;
  }

  for (const i in list) {
    if (list[i] === transactionId) {
      return true;
    }
  }
  list.push(transactionId);
  Session.set('txList', list);
  return false;
};

/**
* @summary updates the session variables related to an executed transactions
* @param {object} transaction the transaction to find in the cache
* @param {boolean} foreign the transaction comes from user in another session
*/
const _updateWalletCache = (transaction, foreign) => {
  let counterPartyId;
  let delta;
  let cacheItem;
  const list = Session.get('voteList');

  if (foreign) {
    if (transaction.kind === 'DELEGATION') {
      if (transaction.output.delegateId === Meteor.userId()) {
        delta = transaction.output.quantity;
      } else if (transaction.input.delegateId === Meteor.userId()) {
        delta = parseInt(transaction.input.quantity * -1, 10);
      }
      for (const item in list) {
        cacheItem = Session.get(list[item]);
        if (list[item] !== 'voter-user-balance' && list[item].substring(0, 18) !== 'vote-user-balance-') {
          // votes
          cacheItem.balance += delta;
          cacheItem.available += delta;
          cacheItem.maxVotes = parseInt(cacheItem.available + cacheItem.inBallot, 10);
        } else if (list[item] === `vote-user-balance-${transaction.input.delegateId}` || list[item] === `vote-user-balance-${transaction.output.delegateId}`) {
          // profiles
          cacheItem.available += parseInt(delta * -1, 10);
          cacheItem.placed += delta;
        }
        cacheItem.placedPercentage = ((cacheItem.placed * 100) / cacheItem.balance);
        Session.set(list[item], cacheItem);
      }
      return;
    }
  } else {
    if (transaction.input.entityId === Meteor.userId()) {
      counterPartyId = transaction.output.entityId;
      delta = parseInt(transaction.input.quantity * -1, 10);
    } else {
      counterPartyId = transaction.input.entityId;
      delta = transaction.output.quantity;
    }
    const currentTx = `vote-${Meteor.userId()}-${counterPartyId}`;
    for (const item in list) {
      cacheItem = Session.get(list[item]);
      if (cacheItem) {
        if (list[item] === `vote-user-balance-${transaction.output.delegateId}` || list[item] === `vote-user-balance-${transaction.input.delegateId}`) {
          // profiles
          cacheItem.balance += parseInt(delta * -1, 10);
          cacheItem.available += parseInt(delta * -1, 10);
          cacheItem.placedPercentage = ((cacheItem.placed * 100) / cacheItem.balance);
        } else if (list[item] !== 'vote-user-balance') {
          // votes
          if (list[item].substring(0, 18) !== 'vote-user-balance-') {
            cacheItem.available += delta;
            cacheItem.placed += parseInt(delta * -1, 10);
          }
          if (list[item] === currentTx) {
            cacheItem.inBallot += parseInt(delta * -1, 10);
          }
          cacheItem.maxVotes = parseInt(cacheItem.available + cacheItem.inBallot, 10);
        } else if (list[item] === 'vote-user-balance' && transaction.output.delegateId !== Meteor.userId()) {
          // wallet
          cacheItem.available += delta;
          if (list[item] === currentTx) {
            cacheItem.inBallot += parseInt(delta * -1, 10);
          }
          cacheItem.placed += parseInt(delta * -1, 10);
          cacheItem.maxVotes = parseInt(cacheItem.available + cacheItem.inBallot, 10);
        } else if (list[item] === 'vote-user-balance' && transaction.output.delegateId === Meteor.userId()) {
          // revokes
          cacheItem.available += delta;
          cacheItem.placed += parseInt(delta * -1, 10);
          cacheItem.placedPercentage = ((cacheItem.placed * 100) / cacheItem.balance);
        }
        Session.set(list[item], cacheItem);
      }
    }
  }
};

/**
* @summary updates the cache of a foreign user balance with information from user collection
* @param {string} sessionId the transaction to find in the cache
* @param {string} userId the user being updated
* @param {object} wallet the wallet info to be used
*/
const _updateUserCache = (sessionId, userId, wallet) => {
  let delegation;
  const cacheWallet = Session.get(sessionId);
  const list = Session.get('voteList');

  if (cacheWallet) {
    if (cacheWallet.available !== wallet.available) {
      cacheWallet.available = wallet.available;
      cacheWallet.balance = wallet.balance;
      cacheWallet.placed = wallet.placed;
      Session.set(sessionId, cacheWallet);

      // check for delegations balances in cache
      for (const item in list) {
        delegation = Session.get(list[item]);
        if (delegation.delegationContract) {
          if (delegation.delegationContract.signatures[0]._id === userId ||
            delegation.delegationContract.signatures[1]._id === userId) {
            delegation.minVotes = parseInt((delegation.inBallot - wallet.available) - 1, 10);
            delegation.balance = wallet.balance;
            delegation.placedPercentage = ((delegation.placed * 100) / delegation.balance);
            Session.set(list[item], delegation);
            break;
          }
        }
      }
    }
  }
};

/**
* @summary decided whether to add or subtract quantity based on tx structure
* @param {object} transaction - the transaction
*/
const _tallyAddition = (transaction) => {
  if (transaction.output.entityId === transaction.contractId) {
    return transaction.output.quantity;
  } else if (transaction.input.entityId === transaction.contractId) {
    return parseInt(transaction.input.quantity * -1, 10);
  }
  return 0;
};

const _getLastBallot = (voterId, contractId) => {
  const tx = Transactions.find({ $and: [{ $or: [{ 'output.entityId': voterId }, { 'input.entityId': voterId }] }, { contractId }] }, { sort: { timestamp: -1 } }).fetch();
  return _.pluck(tx[0].condition.ballot, '_id');
};

/**
* @summary generates a list of voters for a contract without tally
* @param {string} contract - the contract to include a voter list in tally property
* @param {array} ballotList - to include info from transaction
* @returns {array} each item being an object with id and vote quantity.
*/
const _voterList = (contract) => {
  const voters = getTotalVoters(contract, true);
  const voterList = [];

  if (voters.length > 0) {
    for (const i in voters) {
      voterList[i] = {
        _id: voters[i],
        votes: _getVotes(contract._id, voters[i]),
        ballotList: _getLastBallot(voters[i], contract._id),
      };
    }
  }

  return voterList;
};

const _counterParty = (transaction) => {
  if (transaction.contractId === transaction.input.entityId) { return transaction.output.entityId; } return transaction.input.entityId;
};

/**
* @summary on the contract it updates the tally to current vote count
* @param {object} transaction - the new transaction to include in tally
*/
const _tally = (transaction) => {
  const contract = Contracts.findOne({ _id: transaction.contractId });
  const ballotList = _.pluck(transaction.condition.ballot, '_id');
  let found = false;
  let votes;

  let backwardCompatible = false;

  // backwards compatibility
  if (!contract.tally) {
    const dbContract = Contracts.findOne({ _id: transaction.contractId });
    const voterList = _voterList(dbContract);
    contract.tally = {
      lastTransaction: '',
      voter: voterList,
    };
    // contract.tally.choice = _choiceList(dbContract, voterList);
    contract.tally.choice = [];
    backwardCompatible = true;
  }

  // last transaction
  contract.tally.lastTransaction = transaction._id;

  // voter tally
  if (!contract.tally.voter || contract.tally.voter.length === 0) {
    contract.tally.voter = [{
      _id: _counterParty(transaction),
      votes: 0,
      ballotList,
    }];
  }

  found = false;
  if (contract.tally.voter && !backwardCompatible) {
    for (const i in contract.tally.voter) {
      if ((contract.tally.voter[i]._id === transaction.input.entityId) || (contract.tally.voter[i]._id === transaction.output.entityId)) {
        found = true;
        contract.tally.voter[i].votes += _tallyAddition(transaction);
        if (contract.tally.voter[i].votes === 0) {
          contract.tally.voter.splice(i, 1);
          break;
        }
        contract.tally.voter[i].ballotList = ballotList;
      }
    }
    if (!found) {
      contract.tally.voter.push({
        _id: _counterParty(transaction),
        votes: _tallyAddition(transaction),
        ballotList,
      });
    }
  }

  // choice tally
  for (const i in contract.ballot) {
    votes = 0;
    found = false;
    for (const j in contract.tally.voter) {
      if (_.contains(contract.tally.voter[j].ballotList, contract.ballot[i]._id)) {
        votes += contract.tally.voter[j].votes;
      }
    }
    if (contract.tally.choice.length > 0) {
      for (const j in contract.tally.choice) {
        for (const k in contract.tally.choice[j].ballot) {
          if (contract.tally.choice[j].ballot[k]._id === contract.ballot[i]._id) {
            contract.tally.choice[j].votes = votes;
            found = true;
            break;
          }
        }
        if (found) { break; }
      }
    }
    if (!found || !contract.tally.choice || contract.tally.choice.length === 0) {
      contract.tally.choice.push({
        ballot: [contract.ballot[i]],
        votes,
      });
    }
  }

  // update in db
  Contracts.update({ _id: transaction.contractId }, { $set: { tally: contract.tally, ballot: contract.ballot } });
};

/**
* @summary inserts ticket data to a contract affected by a crypto transaction
* @param {string} _id of contract to update
* @param {array} tickets from transaction being processed
* @return {boolean} success of insert
*/
const _insertBlockchainTicket = (_id, tickets) => {
  const contract = Contracts.findOne({ _id });
  const blockchain = contract.blockchain;

  if (contract && blockchain) {
    if (!blockchain.tickets || blockchain.tickets.length === 0) {
      blockchain.tickets = tickets;
    } else if (blockchain.tickets.length > 0) {
      for (let i = 0; i < tickets.length; i += 1) {
        blockchain.tickets.push(tickets[i]);
      }
    }
    Contracts.update({ _id }, { $set: { 'blockchain.tickets': blockchain.tickets } });
  }
};

/**
* @summary counts the total blockchain based votes on a given contract
* @param {string} _id where to count votes
*/
const _tallyBlockchainVotes = (_id) => {
  const contract = Contracts.findOne({ _id });
  const tickets = contract.blockchain.tickets;

  if (tickets.length > 0) {
    let totalPending = new BigNumber(0);
    let totalConfirmed = new BigNumber(0);
    let totalFail = new BigNumber(0);
    let votes;

    for (let i = 0; i < tickets.length; i += 1) {
      votes = new BigNumber(tickets[i].value);

      switch (tickets[i].status) {
        case 'CONFIRMED':
          totalConfirmed = totalConfirmed.plus(votes);
          break;
        case 'FAIL':
          totalFail = totalFail.plus(votes);
          break;
        case 'PENDING':
        default:
          totalPending = totalPending.plus(votes);
      }
    }

    const score = {
      totalPending: totalPending.toString(),
      totalConfirmed: totalConfirmed.toString(),
      totalFail: totalFail.toString(),
      value: parseFloat(smallNumber(totalConfirmed, contract.blockchain.coin.code) + smallNumber(totalPending, contract.blockchain.coin.code), 10),
      finalConfirmed: parseFloat(smallNumber(totalConfirmed, contract.blockchain.coin.code), 10),
      finalPending: parseFloat(smallNumber(totalPending, contract.blockchain.coin.code), 10),
      finalFail: parseFloat(smallNumber(totalFail, contract.blockchain.coin.code), 10),
    };
    Contracts.update({ _id }, { $set: { 'blockchain.score': score } });
  }
};

/**
* @summary adds voter to the contract
* @param {string} _id contract to add votes to
* @param {string} voterId voter to add
* @param {string} txId ticket of last transction
*/
const _addVoter = (_id, voterId, txId) => {
  const contract = Contracts.findOne({ _id });

  contract.tally.lastTransaction = txId;

  if (!contract.tally.voter || contract.tally.voter.length === 0) {
    contract.tally.voter = [{
      _id: voterId,
    }];
  }
  found = false;
  if (contract.tally.voter) {
    for (let i = 0; i < contract.tally.voter.length; i += 1) {
      if (contract.tally.voter[i]._id === voterId) {
        found = true;
      }
    }
    if (!found) {
      contract.tally.voter.push({
        _id: voterId,
      });
    }
  }
  Contracts.update({ _id: contract._id }, { $set: { tally: contract.tally }});
}

/**
* @summary create a new transaction between two parties
* @param {string} senderId - user or collective allocating the funds
* @param {string} receiverId - user or collective receiving the funds
* @param {number} votes - transaction size in votes
* @param {object} settings - additional settings to be stored on the ledger
* @param {function} callback - once everything's done, what is left to do?
*/
const _transact = (senderId, receiverId, votes, settings, callback) => {
  // default settings
  let defaultSettings = {};
  let finalSettings = {};
  defaultSettings = {
    currency: 'VOTES',
    kind: 'VOTE',
    contractId: false,
  };

  if (settings === undefined) {
    finalSettings = defaultSettings;
  } else {
    finalSettings = Object.assign(defaultSettings, settings);
  }

  if (senderId === receiverId) {
    _transactionMessage('INVALID');
    return null;
  }

  let txId;
  let processing;
  let newTx;

  // build transaction
  const newTransaction = {
    input: {
      entityId: senderId,
      address: _getWalletAddress(senderId),
      entityType: _getEntityType(senderId),
      quantity: votes,
      currency: finalSettings.currency,
      delegateId: _getDelegateId(senderId, receiverId, true, finalSettings.kind),
    },
    output: {
      entityId: receiverId,
      address: _getWalletAddress(receiverId),
      entityType: _getEntityType(receiverId),
      quantity: votes,
      currency: finalSettings.currency,
      delegateId: _getDelegateId(senderId, receiverId, false, finalSettings.kind),
    },
    kind: finalSettings.kind,
    contractId: finalSettings.contractId,
    timestamp: getTimestamp(),
    status: 'PENDING',
    condition: finalSettings.condition,
    geo: settings.geo,
  };

  // blockchain transaction
  if (settings.kind === 'CRYPTO') {
    // input carries information of sender
    newTransaction.input.address = settings.input.address.toLowerCase();

    // output carries information of receiver or smart contract address if token ticket
    newTransaction.output.address = settings.output.address.toLowerCase();

    // blockchain info
    newTransaction.blockchain = settings.blockchain;

    // update tally on contract
    _insertBlockchainTicket(newTransaction.output.entityId, newTransaction.blockchain.tickets);
    _tallyBlockchainVotes(newTransaction.output.entityId);

    // executes the transaction
    newTransaction.status = 'CONFIRMED';
    txId = Transactions.insert(newTransaction);
    newTx = Transactions.findOne({ _id: txId });

    // adds voter
    _addVoter(newTransaction.output.entityId, senderId, newTx._id)

    // go to interface
    if (callback !== undefined) { callback(); }

    return txId;

  // web transaciton
  } /* 
    else {
    // executes the transaction
    txId = Transactions.insert(newTransaction);
    processing = _processTransaction(txId);
    newTx = Transactions.findOne({ _id: txId });


    // NOTE: uncomment for testing

    // console.log(txId);
    // console.log(processing);


    if (_transactionMessage(processing)) {
      // once transaction done, run callback
      if (callback !== undefined) { callback(); }

      newTx = Transactions.findOne({ _id: txId });
      if (Meteor.isClient) {
        _processedTx(newTx._id);
        _updateWalletCache(newTx, false);
      }

      // update tally in contract excluding subsidy
      if (newTx.kind === 'VOTE' && newTx.input.entityType !== 'COLLECTIVE' && newTx.output.entityType !== 'COLLECTIVE') {
        _tally(newTx);
      }

      notify(newTx);

      return txId;
    }
  } */
  return null;
};

/**
* @summary generates the first transaction a member gets from the collective
* @param {string} userId - id of user being generated within collective
*/
const _genesisTransaction = (userId) => {
  const user = Meteor.users.findOne({ _id: userId });

  // veryfing genesis...
  // TODO this is not right, should check against Transactions collection.
  if (user.profile.wallet !== undefined) {
    if (user.profile.wallet.ledger.length > 0) {
      if (user.profile.wallet.ledger[0].entityType === 'COLLECTIVE') {
        // this user already had a genesis
        return;
      }
    }
  }

  // generate first transaction from collective to new member
  user.profile.wallet = _generateWalletAddress(user.profile.wallet);
  Meteor.users.update({ _id: userId }, { $set: { profile: user.profile } });
  _transact(Meteor.settings.public.Collective._id, userId, rules.VOTES_INITIAL_QUANTITY);
};

/**
* @summary reads balance from publicAddress and loads it into user wallet
* @param {string} userId - id of user being generated within collective
*/
const _loadExternalCryptoBalance = (userId) => {
  const user = Meteor.users.findOne({ _id: userId });
  if (user.services.metamask != null) {
    const _publicAddress = user.services.metamask.publicAddress;
    let weiBalance;

    getWeiBalance(_publicAddress).then(function (_weiBalance) {
      weiBalance = _weiBalance;
      return getTokenData(_publicAddress);
    }).then(function (tokenData) {
      user.profile.wallet.reserves[0].token = 'WEI';
      user.profile.wallet.reserves[0].balance = weiBalance.toNumber();
      user.profile.wallet.reserves[0].available = weiBalance.toNumber();

      for (let i = 0; i < tokenData.length; i += 1) {
        const foundInWallet = user.profile.wallet.reserves.findIndex(t => t.token === tokenData[i].token);
        if (foundInWallet !== -1) {
          // update token already found in wallet
          user.profile.wallet.reserves[foundInWallet].balance = tokenData[i].balance;
          user.profile.wallet.reserves[foundInWallet].available = tokenData[i].available;
        } else {
          // new token to wallet
          user.profile.wallet.reserves.push(tokenData[i]);
        }
      }
      Meteor.users.update({ _id: userId }, { $set: { profile: user.profile } });
    }).catch(function (error) {
      console.log('DEBUG - transaction.js - caught error ', error);
    });
  }
};

export const processedTx = _processedTx;
export const updateUserCache = _updateUserCache;
export const updateWalletCache = _updateWalletCache;
export const processTransaction = _processTransaction;
export const generateWalletAddress = _generateWalletAddress;
export const getTransactions = _getTransactions;
export const transactionMessage = _transactionMessage;
export const getVotes = _getVotes;
export const transact = _transact;
export const genesisTransaction = _genesisTransaction;
export const loadExternalCryptoBalance = _loadExternalCryptoBalance;
export const tallyBlockchainVotes = _tallyBlockchainVotes;
