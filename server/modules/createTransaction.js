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
  if (settings == undefined) {
    var settings = new Object();
    settings = {
      currency: CURRENCY_VOTES,
      kind: KIND_VOTE
    }
  }

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
    contractId: 0, //TODO
    timestamp: new Date(),
    status: STATUS_PENDING
  };

  console.log('[_createTransaction] generated this new transaction:');
  console.log(newTransaction);

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
  if (entityType == ENTITY_INDIVIDUAL) {
    var user = Meteor.users.findOne({ _id: entityId });
  } else {
    var user = Collectives.findOne({ _id: entityId });
  }
  if (user == undefined) {
    console.log('[_getWalletAddress] ERROR: Entity could not be found.');
    return;
  }

  var wallet = user.profile.wallet;
  var collectiveId = Meteor.settings.public.Collective._id;

  console.log('[_getWalletAddress] getting info for ');
  console.log(user);

  if (wallet.address != undefined && wallet.address.length > 0) {
    console.log('[_getWalletAddress] wallet has an address');
    return _getAddressHash(wallet.address, collectiveId);
  } else {
    console.log('[_getWalletAddress] generate a new address for this collective');
    user.profile.wallet = Modules.server.generateWalletAddress(user.profile.wallet);
    if (entityType == ENTITY_INDIVIDUAL) {
      Meteor.users.update({ _id: entityId }, { $set: { profile: user.profile } });
    } else if (entityType == ENTITY_COLLECTIVE) {
      Collectives.update({ _id: entityId }, { $set: { profile: user.profile } });
    };
    return _getAddressHash(user.profile.wallet.address, collectiveId);
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

Modules.server.generateWalletAddress = _generateWalletAddress;
Modules.server.transact = _createTransaction;
