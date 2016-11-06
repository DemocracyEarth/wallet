import Collectives from '../collectives/Collectives';
import Transactions from './Transactions';
import { showFullName } from '../../startup/both/modules/utils';
import { guidGenerator } from '../../startup/both/modules/crypto';

/**
* @summary create a new transaction between two parties
* @param {string} senderId - user or collective allocating the funds
* @param {string} receiverId - user or collective receiving the funds
* @param {object} settings - additional settings to be stored on the ledger
*/
const _createTransaction = (senderId, receiverId, quantity, settings) => {
  console.log('[_createTransaction] creating new transaction...');
  console.log('[_createTransaction] sender: ' + senderId);
  console.log('[_createTransaction] receiver: ' + receiverId);

  // default settings
  let defaultSettings = {};
  defaultSettings = {
    currency: 'VOTES',
    kind: 'VOTE',
    contractId: false // _getContractId(senderId, receiverId, settings.kind),
  };

  if (settings == undefined) {
    var settings = new Object();
    settings = defaultSettings;
  } else {
    settings = Object.assign(defaultSettings, settings);
  };

  //build transaction
  var newTransaction =  {
    input: {
      entityId: senderId,
      address: _getWalletAddress(senderId),
      entityType: _getEntityType(senderId),
      quantity: quantity,
      currency: settings.currency
    },
    output: {
      entityId: receiverId,
      address: _getWalletAddress(receiverId),
      entityType: _getEntityType(receiverId),
      quantity: quantity,
      currency: settings.currency
    },
    kind: settings.kind,
    contractId: settings.contractId,
    timestamp: new Date(),
    status: 'PENDING',
    condition: settings.condition
  };

  console.log('[_createTransaction] generated new transaction settings');

  //executes the transaction
  var txId = Transactions.insert(newTransaction);
  if (_processTransaction(txId)) { return txId; };
  return newTransaction;
}


/***
* processes de transaction after insert and updates wallet of involved parties
* @param {string} txId - transaction identificator
***/
let _processTransaction = (txId) => {

  var transaction = Transactions.findOne({ _id: txId });
  var senderProfile = _getProfile(transaction.input);
  var receiverProfile = _getProfile(transaction.output);

  //TODO all transactions are for VOTE type, develop in the future transactions for BITCOIN or multi-currency conversion.
  //TODO verification of funds

  var sender = senderProfile.wallet;

  sender.ledger.push({
    txId: txId,
    quantity: parseInt(0 - transaction.input.quantity),
    entityId: transaction.output.entityId,
    entityType: transaction.output.entityType,
    currency: transaction.input.currency
  });
  sender.placed += parseInt(transaction.input.quantity);
  sender.available = sender.balance - sender.placed;
  senderProfile.wallet = Object.assign(senderProfile.wallet, sender);

  if (senderProfile.firstName) {
    console.log('[_processTransaction] sender in transaction is entity: ' + showFullName(senderProfile.firstName, senderProfile.lastName));
  } else {
    console.log('[_processTransaction] sender in transaction is a Contract with title: ' + senderProfile.title);
  }


  var receiver = receiverProfile.wallet;
  receiver.ledger.push({
    txId: txId,
    quantity: parseInt(transaction.output.quantity),
    entityId: transaction.input.entityId,
    entityType: transaction.input.entityType,
    currency: transaction.output.currency
  });
  receiver.available += parseInt(transaction.output.quantity);
  receiver.balance += receiver.available;

  console.log('[_processTransaction] checking if ballot stored in this transaction...');
  if (transaction.condition.ballot) {
    console.log('[_processTransaction] found ballot in this transaction');
    fullBallot = new Array();
    last = receiver.ledger.length - 1;

    for (k in transaction.condition.ballot) {
      fullBallot.push(transaction.condition.ballot[k])
    };
    console.log('[_processTransaction] ballot content:');
    console.log(fullBallot);
    receiver.ledger[last] = Object.assign(receiver.ledger[last], {ballot: fullBallot});
  } else {
    console.log('[_processTransaction] no ballot found.');
  }
  receiverProfile.wallet = Object.assign(receiverProfile.wallet, receiver);

  if (receiverProfile.firstName) {
    console.log('[_processTransaction] receiver in transaction is entity: ' + showFullName(receiverProfile.firstName, receiverProfile.lastName));
  } else {
    console.log('[_processTransaction] receiver in transaction is a Contract with title: ' + receiverProfile.title);
  }

  //update wallets
  _updateWallet(transaction.input.entityId, transaction.input.entityType, senderProfile);
  _updateWallet(transaction.output.entityId, transaction.output.entityType, receiverProfile);

  //set this transaction as processed
  return Transactions.update({ _id: txId }, { $set: { status : 'CONFIRMED' }});

}

/*
let _updateBalance = (wallet) => {
  var balance = new Number(0);
  for (i in wallet.ledger) {
      wallet.ledger[]
  }
}
*/

/***
* returns the profile object of an entity from a transaction
* @param {string} transactionSignal - input or output of a transaction object
* @return {object} profile - profile object of entity
***/
let _getProfile = (transactionSignal) => {
  switch (transactionSignal.entityType) {
    case 'INDIVIDUAL':
      return Meteor.users.findOne( { _id: transactionSignal.entityId }).profile;
      break;
    case 'COLLECTIVE':
      return Collectives.findOne( { _id: transactionSignal.entityId }).profile;
      break;
    case 'CONTRACT':
      return Contracts.findOne({ _id: transactionSignal.entityId });
      break;
  }
}

/***
* updates wallet object of an individual or collective
* @param {string} entityId - entity
* @param {string} entityType -  individual or collective
* @param {object} wallet - wallet object of entity
***/
let _updateWallet = (entityId, entityType, profile) => {
  console.log('[_updateWallet] updating wallet of entityId :' + entityId);
  switch (entityType) {
    case 'INDIVIDUAL':
      Meteor.users.update( { _id: entityId }, { $set : { profile : profile } });
      break;
    case 'COLLECTIVE':
      Collectives.update( { _id: entityId }, { $set : { profile : profile } });
      break;
    case 'CONTRACT':
      Contracts.update({ _id: entityId }, { $set: { wallet: profile.wallet }});
      break;
  }
}

/***
* generates a contract specifying details of this transaction
* @param {string} senderId - user or collective allocating the funds
* @param {string} receiverId - user or collective receiving the funds
* @param {string} kind - type of contract, VOTE, DELEGATION or MEMBERSHIP
* @return {string} id - contract id of the reference agreement
****/
let _getContractId = (senderId, receiverId, kind) => {
  //TODO
}


/***
* looks at what type of entity (collective or individual) doing transaction
* @return {string} entityType - a string with constant of entity type
***/
let _getEntityType = (entityId) => {
  if (Meteor.users.findOne({ _id: entityId })) {
    return 'INDIVIDUAL';
  } else if (Collectives.findOne({ _id: entityId })) {
    return 'COLLECTIVE';
  } else if (Contracts.findOne({ _id: entityId})) {
    return 'CONTRACT';
  } else {
    return 'UNKNOWN';
  };
}

/***
* looks for an appropiate address to use for this user
* @param {string} entityId - id of the user's wallet being used
* @return {string} hash - a string with a wallet address direction for a user
***/
let _getWalletAddress = (entityId) => {
  var entityType = _getEntityType(entityId);

  switch (entityType) {
    case 'INDIVIDUAL':
      var user = Meteor.users.findOne({ _id: entityId });
      break;
    case 'COLLECTIVE':
      var user = Collectives.findOne({ _id: entityId });
      break;
    case 'CONTRACT':
      var user = Contracts.findOne({ _id: entityId});
      break;
    default:
      console.log('[_getWalletAddress] ERROR: entityId ' + entityId + ' could not be found.');
      return false;
  }

  if (user.profile != undefined) {
    var wallet = user.profile.wallet;
  } else {
    var wallet = user.wallet; //entity is a contract
  }
  var collectiveId = Meteor.settings.public.Collective._id;

  console.log('[_getWalletAddress] getting info for entityId ' + entityId + '.');

  if (wallet.address != undefined && wallet.address.length > 0) {
    console.log('[_getWalletAddress] entity wallet already has an address.');
    return _getAddressHash(wallet.address, collectiveId);
  } else {
    console.log('[_getWalletAddress] generating a new address for this collective...');
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
        console.log('[_getWalletAddress] ERROR: entityId ' + entityId + ' could not be found.');
        return false;
    }
    return _getAddressHash(wallet.address, collectiveId);
  }
};

/**
* returns the has for the address that is from corresponding collective
* @param {array} address - a wallet from a user containing all directions
* @param {string} collectiveId - matching collective
***/
let _getAddressHash = (address, collectiveId) => {
  for (var i = 0; i < address.length; i ++) {
    if (address[i].collectiveId == collectiveId) {
      return address[i].hash;
    }
  }
}

/**
* @summary generates a new address given a wallet
* @param {object} wallet - a wallet from a user containing all directions
***/
const _generateWalletAddress = (wallet) => {
  console.log('[_generateWalletAddress] generating a new address for wallet entered as parameter.');
  wallet.address.push(_getCollectiveAddress());
  return wallet;
};

/***
* generates a new address specific to the collective running this instance
* @return {object} object - returns an object containing a new hash and this collective Id.
***/
let _getCollectiveAddress = () => {
  console.log('[_getCollectiveAddress] generating new address specific to the collective running this instance...');
  return {
    hash: guidGenerator(),
    collectiveId: Meteor.settings.public.Collective._id
  };
};

export const processTransaction = _processTransaction;
export const generateWalletAddress = _generateWalletAddress;
export const transact = _createTransaction;
