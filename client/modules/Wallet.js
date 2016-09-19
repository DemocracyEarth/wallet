/*****
/* Wallet class for transaction operations
/* @param {object} wallet - wallet object that can be set from a user's profile.
/* @constructor {object} Wallet - constructor function
******/
Wallet = function (wallet) {

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
   this.mode =  WALLET_MODE_PENDING;
   this._initialSliderWidth = $('#voteSlider').width();

   this.allocateVotes(this.available / 2);
   this.refresh();
}

Wallet.prototype.allocateVotes = function (quantity) {
  if (this.enabled) {
    this.placedPercentage = ((this.placed * 100) / this.balance);
    this.allocatePercentage = ((quantity * 100) / this.balance); //((100 - this.placedPercentage) / 2);
    this.allocateQuantity = _scope(quantity, this.available); //parseInt((this.balance * this.allocatePercentage) / 100);
  }
  this.refresh();
}

Wallet.prototype.sliderInput = function (pixels) {
  if (pixels == undefined) { pixels = 0 };
  var maxWidth = $('#voteBar').width() - (($('#voteBar').width() * parseInt((this.placed * 100) / this.balance)) / 100);

  var handleLeft = ($('#voteHandle').offset().left - $('#voteBar').offset().left);
  var percentage = (handleLeft * 100) / $('#voteBar').width();
  this.allocateVotes(parseInt((percentage * this.balance) / 100));
  
  this.sliderWidth = _scope((this._initialSliderWidth + pixels), maxWidth, ($('#voteHandle').width()));
}

Wallet.prototype.refresh = function () {
  //$('#voteSlider').width(this.allocatePercentage + '%');
}

let _scope = (value, max, min) => {
  if (min == undefined) { var min = 0 }; if (value < min) { return min } else if (value > max) { return max } else { return value };
}

/*****
/* decides wether to get vots from a user on DB or from current active sessions of user
/* @param {string} userId - user ID
/* @param {string} sessionVar - session variable for interface purposes
/* @return {number} value - quantity of votes
******/
let _getWalletVotes = (userId, sessionVar) => {
  if (userId != Meteor.userId()) {
    Meteor.call('getUserInfo', userId, function (error, data) {
      if (error)
        console.log(error);

      return _setVote(data.profile.wallet, sessionVar);
    });
  } else {
    if (Meteor.user().profile.wallet != undefined) {
      return _setVote(Meteor.user().profile.wallet, sessionVar);
    } else {
      return 0;
    }
  }
}


/*****
/* returns specific quantity of votes from a wallet and sets a session variable
/* @param {object} wallet - wallet object containing vote balance
/* @param {string} sessionVar - a session variable to be used for UX and specifying vote value
/* @return {number} value - quantity of votes
******/
let _setVote = (wallet, sessionVar) => {
  if (wallet != undefined) {
    switch(sessionVar) {
      case 'availableVotes':
        value = wallet.available;
        break;
      case 'placedVotes':
        value = wallet.placed;
        break;
    }
    Session.set(sessionVar, value);
    return value;
  }
}

/*****
/* verify if user has already voted
/* @param {object} ledger - ledger of contract or entity to verify on
/* @param {string} userId - id of user
/* @return {boolean} value - true or false
******/
let _verifyVote = (ledger, userId) => {
  for (entity in ledger) {
    if (ledger[entity].entityId == userId) {
      var wallet = Session.get('newVote');
      wallet.allocatePercentage = parseInt((ledger[entity].quantity * 100) / wallet.balance);
      wallet.allocateQuantity = ledger[entity].quantity;
      wallet.mode = WALLET_MODE_EXECUTED;
      Session.set('newVote', wallet);
      return true;
    }
  }
  return false;
}

Modules.client.verifyVote = _verifyVote
Modules.client.getWalletVotes = _getWalletVotes;
