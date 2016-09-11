/***
* create a new transaction between two parties
* @param {string} senderId - user or collective allocating the funds
* @param {string} receiverId - user or collective receiving the funds
* @param {object} settings - additional settings to be stored on the ledger
****/
let _createTransaction = (senderId, receiverId, quantity, settings) => {

  console.log('New transaction:');
  console.log('sender: ' + senderId);
  console.log('receiver: ' + receiverId);

}

Modules.both.transact = _createTransaction;
