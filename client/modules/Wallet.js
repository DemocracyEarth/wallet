/*****
/* Wallet class for transaction operations
/* @param {object} wallet - wallet object that can be set from a user's profile.
/* @constructor {object} Wallet - constructor function
******/
function Wallet (wallet) {

   // properties
   if (wallet == undefined) {
     this.address = new Array();
     this.ledger = new Array();
     this.available = new Number(0);
     this.balance = new Number(0);
     this.placed = new Number(0)
     this.currency = CURRENCY_VOTES;
   } else {
     this.address = wallet.address;
     this.ledger = wallet.ledger;
     this.balance = wallet.balance;
     this.available = wallet.available;
     this.placed = wallet.placed;
     this.currency = wallet.currency;
   }

   this.initialized = true;
   this.enabled = true;

}
