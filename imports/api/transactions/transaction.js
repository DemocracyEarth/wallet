import { Meteor } from 'meteor/meteor';

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
      // console.log(`[_getWalletAddress] ERROR: entityId ${entityId} could not be found.`);
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

  // push to ledgers

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
  sender.available = sender.balance - sender.placed;
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
  receiver.balance += receiver.available;
  receiverProfile.wallet = Object.assign(receiverProfile.wallet, receiver);

  // assign ballots if any
  if (transaction.condition.ballot) {
    sender.ledger = assignBallot(sender.ledger, transaction.condition.ballot);
    receiver.ledger = assignBallot(receiver.ledger, transaction.condition.ballot);
  }

  // update wallets
  _updateWallet(transaction.input.entityId, transaction.input.entityType, senderProfile);
  _updateWallet(transaction.output.entityId, transaction.output.entityType, receiverProfile);

  // set this transaction as processed
  return Transactions.update({ _id: txId }, { $set: { status: 'CONFIRMED' } });
};

/**
* @summary create a new transaction between two parties
* @param {string} senderId - user or collective allocating the funds
* @param {string} receiverId - user or collective receiving the funds
* @param {object} settings - additional settings to be stored on the ledger
* @param {string} process - true if everything turned out right, else: INSUFFICIENT
*/
const _createTransaction = (senderId, receiverId, votes, settings) => {
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
    timestamp: new Date(),
    status: 'PENDING',
    condition: finalSettings.condition,
  };

  // executes the transaction
  const txId = Transactions.insert(newTransaction);
  const process = _processTransaction(txId);

  switch (process) {
    case 'INSUFFICIENT':
      displayNotice('not-enough-funds', true);
      return false;
    case true:
    default:
      return txId;
  }
};

export const processTransaction = _processTransaction;
export const generateWalletAddress = _generateWalletAddress;
export const transact = _createTransaction;
