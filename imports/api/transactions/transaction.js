import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { rules } from '/lib/const';

import { displayNotice } from '/imports/ui/modules/notice';
import { Contracts } from '/imports/api/contracts/Contracts';
import { Collectives } from '/imports/api/collectives/Collectives';
import { guidGenerator } from '/imports/startup/both/modules/crypto';
import { Transactions } from './Transactions';


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
      Contracts.update({ _id: entityId }, { $set: { wallet: wallet } });
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
    default: // 'CONTRACT'
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
* @summary assigns value of ballot to transaction Participants
* @param {object} ballot - object with ballot info
* @param {object} ledger - ledger to attach ballot to
*/
const assignBallot = (ledger, ballot) => {
  const fullBallot = [];
  const last = ledger.length - 1;
  const finalLedger = ledger;
  for (const k in ballot) {
    fullBallot.push(ballot[k]);
  }
  finalLedger[last] = Object.assign(ledger[last], { ballot: fullBallot });
  return finalLedger;
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
  let transactions = _getTransactions(wallet, creditorId);

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

  // TODO all transactions are for VOTE type, develop for BITCOIN or multi-currency conversion.
  // TODO encrypted mode hooks this.

  // verify sender has enough funds
  if (senderProfile.wallet.available < transaction.input.quantity) {
    return 'INSUFFICIENT';
  }

  // transact
  const sender = senderProfile.wallet;
  sender.ledger.push({
    txId: ticket,
    quantity: transaction.input.quantity,
    entityId: transaction.output.entityId,
    entityType: transaction.output.entityType,
    currency: transaction.input.currency,
    transactionType: 'OUTPUT',
  });
  sender.placed += parseInt(transaction.input.quantity, 10);
  sender.available = parseInt(sender.balance - sender.placed, 10);
  sender.balance = parseInt(sender.placed + sender.available, 10);
  senderProfile.wallet = Object.assign(senderProfile.wallet, sender);

  const receiver = receiverProfile.wallet;
  receiver.ledger.push({
    txId: ticket,
    quantity: parseInt(transaction.output.quantity, 10),
    entityId: transaction.input.entityId,
    entityType: transaction.input.entityType,
    currency: transaction.output.currency,
    transactionType: 'INPUT',
  });
  receiver.available += parseInt(transaction.output.quantity, 10);
  //receiver.placed = parseInt(receiver.placed - _restoredTokens(transaction.output.quantity, _debt(receiver, transaction.input.entityId, 'OUTPUT')), 10);
  receiver.placed = parseInt(receiver.placed - _restoredTokens(transaction.output.quantity, _debt(transaction.output.entityId, transaction.input.entityId, 'output')), 10);

  receiver.balance = parseInt(receiver.placed + receiver.available, 10);
  receiverProfile.wallet = Object.assign(receiverProfile.wallet, receiver);

  // assign ballots if any
  if (transaction.condition.ballot) {
  //  sender.ledger = assignBallot(sender.ledger, transaction.condition.ballot);
  //  receiver.ledger = assignBallot(receiver.ledger, transaction.condition.ballot);
  }

  // update wallets
  //_updateWallet(transaction.input.entityId, transaction.input.entityType, senderProfile);
  //_updateWallet(transaction.output.entityId, transaction.output.entityType, receiverProfile);

  // set this transaction as processed
  return Transactions.update({ _id: txId }, { $set: { status: 'CONFIRMED' } });
};

/**
* @summary create a new transaction between two parties
* @param {string} senderId - user or collective allocating the funds
* @param {string} receiverId - user or collective receiving the funds
* @param {number} votes - transaction size in votes
* @param {object} settings - additional settings to be stored on the ledger
* @param {string} process - true if everything turned out right, else: INSUFFICIENT
* @param {function} callback - once everything's done, what is left to do?
*/
const _createTransaction = (senderId, receiverId, votes, settings, callback) => {
  // default settings
  let defaultSettings = {};
  let finalSettings = {};
  defaultSettings = {
    currency: 'VOTES',
    kind: 'VOTE',
    contractId: false, // _getContractId(senderId, receiverId, settings.kind),
  };

  if (settings === undefined) {
    finalSettings = defaultSettings;
  } else {
    finalSettings = Object.assign(defaultSettings, settings);
  }

  // sync time with server
  Meteor.call('getServerTime', function (error, result) {
    Session.set('time', result);
  });

  // build transaction
  const newTransaction = {
    input: {
      entityId: senderId,
      address: _getWalletAddress(senderId),
      entityType: _getEntityType(senderId),
      quantity: votes,
      currency: finalSettings.currency,
      transactionType: 'INPUT',
    },
    output: {
      entityId: receiverId,
      address: _getWalletAddress(receiverId),
      entityType: _getEntityType(receiverId),
      quantity: votes,
      currency: finalSettings.currency,
      transactionType: 'OUTPUT',
    },
    kind: finalSettings.kind,
    contractId: finalSettings.contractId,
    timestamp: Session.get('time'),
    status: 'PENDING',
    condition: finalSettings.condition,
  };

  // executes the transaction
  const txId = Transactions.insert(newTransaction);
  const process = _processTransaction(txId);

  // once transaction done, run callback
  if (callback !== undefined) { callback(); }

  switch (process) {
    case 'INSUFFICIENT':
      displayNotice('not-enough-funds', true);
      return false;
    case true:
    default:
      return txId;
  }
};

/**
* @summary generates the first transaction a member gets from the collective
* @param {string} userId - id of user being generated within collective
*/
const _genesisTransaction = (userId) => {
  const user = Meteor.users.findOne({ _id: userId });

  // veryfing genesis...
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
  _createTransaction(Meteor.settings.public.Collective._id, userId, rules.VOTES_INITIAL_QUANTITY);
};

/**
* @summary gets array with all the transactions of a given user with a contract
* @param {string} userId - userId to be checked
* @param {string} contractId - contractId to be checked
*/
const _getTransactions = (userId, contractId) => {
    return _.sortBy(
      _.union(
        _.filter(Transactions.find({ 'input.entityId': userId }).fetch(), (item) => { return (item.output.entityId === contractId) }, 0),
        _.filter(Transactions.find({ 'output.entityId': userId }).fetch(), (item) => { return (item.input.entityId === contractId) }, 0)),
        'timestamp');
}

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
}

/**
* @summary gets the quantity of votes a given user has on a ledger
* @param {object} contractId - contractId to be checked
* @param {object} userId - userId to be checked
*/
const _getVotes = (contractId, userId) => {
  return _.reduce(getTransactions(userId, contractId), (memo, num, index) => {
      if (index === 1) {
        return _voteCount(memo, userId) + _voteCount(num, userId);
      }
      return memo + _voteCount(num, userId);
  });
};


export const processTransaction = _processTransaction;
export const generateWalletAddress = _generateWalletAddress;
export const getTransactions = _getTransactions;
export const getVotes = _getVotes;
export const transact = _createTransaction;
export const genesisTransaction = _genesisTransaction;
