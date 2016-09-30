import {default as Modules} from "./modules";

/***
* create a new transaction between two parties
* @param {string} senderId - user or collective allocating the funds
* @param {string} receiverId - user or collective receiving the funds
* @param {object} settings - additional settings to be stored on the ledger
****/
let _createTransaction = (senderId, receiverId, quantity, settings) => {

  console.log('[_createTransaction] starting new transaction...');
  console.log('[_createTransaction] sender: ' + senderId);
  console.log('[_createTransaction] receiver: ' + receiverId);

  //default settings
  var defaultSettings = new Object();
  defaultSettings = {
    currency: CURRENCY_VOTES,
    kind: KIND_VOTE,
    contractId: false //_getContractId(senderId, receiverId, settings.kind),
  }

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
    status: TRANSACTION_STATUS_PENDING,
    condition: settings.condition
  };

  console.log('[_createTransaction] generated a new transaction settings');

  //executes the transaction
  var txId = Transactions.insert(newTransaction);
  if (_processTransaction(txId)) { return txId; };

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

  console.log('[_processTransaction] sender in transaction:');
  console.log(senderProfile);

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

  console.log('[_processTransaction] check if ballot stored');
  console.log(transaction.condition.ballot);
  if (transaction.condition.ballot) {
    console.log('[_processTransaction] it has ballot');
    fullBallot = new Array();
    last = receiver.ledger.length - 1;

    for (k in transaction.condition.ballot) {
      fullBallot.push(transaction.condition.ballot[k])
    };
    console.log('[_processTransaction] fullballot:');
    console.log(fullBallot);
    receiver.ledger[last] = Object.assign(receiver.ledger[last], {ballot: fullBallot});

  }
  receiverProfile.wallet = Object.assign(receiverProfile.wallet, receiver);

  console.log('[_processTransaction] receiver in transaction:');
  console.log(receiverProfile);

  //update wallets
  _updateWallet(transaction.input.entityId, transaction.input.entityType, senderProfile);
  _updateWallet(transaction.output.entityId, transaction.output.entityType, receiverProfile);

  //set this transaction as processed
  return Transactions.update({ _id: txId }, { $set: { status : TRANSACTION_STATUS_CONFIRMED }});

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
    case ENTITY_INDIVIDUAL:
      return Meteor.users.findOne( { _id: transactionSignal.entityId }).profile;
      break;
    case ENTITY_COLLECTIVE:
      return Collectives.findOne( { _id: transactionSignal.entityId }).profile;
      break;
    case ENTITY_CONTRACT:
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
    case ENTITY_INDIVIDUAL:
      Meteor.users.update( { _id: entityId }, { $set : { profile : profile } });
      break;
    case ENTITY_COLLECTIVE:
      Collectives.update( { _id: entityId }, { $set : { profile : profile } });
      break;
    case ENTITY_CONTRACT:
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
    return ENTITY_INDIVIDUAL;
  } else if (Collectives.findOne({ _id: entityId })) {
    return ENTITY_COLLECTIVE;
  } else if (Contracts.findOne({ _id: entityId})) {
    return ENTITY_CONTRACT;
  } else {
    return ENTITY_UNKNOWN;
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
    case ENTITY_INDIVIDUAL:
      var user = Meteor.users.findOne({ _id: entityId });
      break;
    case ENTITY_COLLECTIVE:
      var user = Collectives.findOne({ _id: entityId });
      break;
    case ENTITY_CONTRACT:
      var user = Contracts.findOne({ _id: entityId});
      break;
    default:
      console.log('[_getWalletAddress] ERROR: Entity could not be found.');
      return false;
  }

  if (user.profile != undefined) {
    var wallet = user.profile.wallet;
  } else {
    var wallet = user.wallet; //entity is a contract
  }
  var collectiveId = Meteor.settings.public.Collective._id;

  console.log('[_getWalletAddress] getting info for ');
  console.log(user);

  if (wallet.address != undefined && wallet.address.length > 0) {
    console.log('[_getWalletAddress] wallet has an address');
    return _getAddressHash(wallet.address, collectiveId);
  } else {
    console.log('[_getWalletAddress] generate a new address for this collective');
    wallet = Modules.server.generateWalletAddress(wallet);
    switch (entityType) {
      case ENTITY_INDIVIDUAL:
        user.profile.wallet = wallet;
        Meteor.users.update({ _id: entityId }, { $set: { profile: user.profile } });
        break;
      case ENTITY_COLLECTIVE:
        user.profile.wallet = wallet;
        Collectives.update({ _id: entityId }, { $set: { profile: user.profile } });
        break;
      case ENTITY_CONTRACT:
        Contracts.update({ _id: entityId }, { $set: { wallet: wallet } });
        break;
      default:
        console.log('[_getWalletAddress] ERROR: Entity could not be found.');
        return false;
    }
    return _getAddressHash(wallet.address, collectiveId);
  }
};


/****
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

/****
* generates a new address given a wallet
* @param {object} wallet - a wallet from a user containing all directions
***/
let _generateWalletAddress = (wallet) => {
  console.log('[_generateWalletAddress] generates a new address given a wallet');
  wallet.address.push(_getCollectiveAddress());
  return wallet;
};

/***
* generates a new address specific to the collective running this instance
* @return {object} object - returns an object containing a new hash and this collective Id.
***/
let _getCollectiveAddress = () => {
  console.log('[_getCollectiveAddress] generates a new address specific to the collective running this instance');
  return {
    hash: Modules.both.guidGenerator(),
    collectiveId: Meteor.settings.public.Collective._id
  };
};

Modules.server.processTransaction = _processTransaction;
Modules.server.generateWalletAddress = _generateWalletAddress;
Modules.server.transact = _createTransaction;
