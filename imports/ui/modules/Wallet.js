import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

/**
* @summary Wallet class for transaction operations
* @param {object} wallet - wallet object that can be set from a user's profile.
* @constructor {object} Wallet - constructor function
*/
export const Wallet = function(wallet) {
   //properties
   if (wallet == undefined) {
     this.address = new Array();
     this.ledger = new Array();
     this.available = new Number(0);
     this.balance = new Number(0);
     this.placed = new Number(0)
     this.currency = 'VOTES';
   } else {
     Object.assign(this, wallet);
   }

   //private
   this.initialized = true;
   this.enabled = true;
   this.mode =  'PENDING';

   //view
   this._initialSliderWidth = $('#voteSlider').width();
   this.sliderWidth = this._initialSliderWidth;
   this._maxWidth = $('#voteBar').width() - (($('#voteBar').width() * parseInt((this.placed * 100) / this.balance)) / 100) - 2;

   //methods
   if (this.initialized == true) {
     this.allocateVotes(parseInt(this.available * 10 / 100));
     this.initialized = false;
   }

   //controller
   Session.set('newVote', this);
}

Wallet.prototype.allocateVotes = function (quantity, avoidSlider) {
  if (this.enabled) {
    this.placedPercentage = ((this.placed * 100) / this.balance);
    this.allocatePercentage = ((quantity * 100) / this.balance);
    this.allocateQuantity = _scope(quantity, this.available);
  };
  if (!avoidSlider) {
    var sliderWidth = parseInt(($('#voteSlider').width() * this.available) / this._maxWidth);
    var sliderCorrected = parseInt((this._maxWidth * this.allocateQuantity) / this.available);
    this.sliderInput((sliderCorrected - sliderWidth ), true);
  };
}

Wallet.prototype.sliderInput = function (pixels, avoidAllocation) {
  if (pixels == undefined) { pixels = 0 };
  if ($('#voteHandle').offset() != undefined) {
    var percentage = (($('#voteHandle').offset().left - $('#voteBar').offset().left) * 100) / $('#voteBar').width();
    var delta = ($('#voteBar').offset().left + this._maxWidth) - $('#voteBar').offset().left - ($('#voteHandle').width() / 2);
    var votes = parseInt(((this.sliderWidth - + ($('#voteHandle').width() / 2)) * this.available) / delta);
    this.sliderWidth = _scope((this._initialSliderWidth + pixels), this._maxWidth, ($('#voteHandle').width() / 2));
  } else {
    this.sliderWidth = 0;
  }
  if (!avoidAllocation) {
    this.allocateVotes(votes, true);
  }
}

Wallet.prototype.sliderPercentage = function () {
  this.allocatePercentage = parseInt((this.allocateQuantity * 100) / this.balance);
  this.allocateVotes(this.allocateQuantity);
}

let _scope = (value, max, min) => {
  if (min == undefined) { var min = 0 }; if (value < min) { return min } else if (value > max) { return max } else { return value };
}

/**
* @summary decides wether to get vots from a user on DB or from current active sessions of user
* @param {string} userId - user ID
* @param {string} sessionVar - session variable for interface purposes
* @return {number} value - quantity of votes
*/
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


/**
* @summary returns specific quantity of votes from a wallet and sets a session variable
* @param {object} wallet - wallet object containing vote balance
* @param {string} sessionVar - a session variable to be used for UX and specifying vote value
* @return {number} value - quantity of votes
*/
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

/**
* @summary verify if user has already voted
* @param {object} ledger - ledger of contract or entity to verify on
* @param {string} userId - id of user
* @return {boolean} value - true or false
*/
let _verifyVote = (ledger, userId) => {
  for (entity in ledger) {
    if (ledger[entity].entityId == userId) {
      var wallet = Session.get('newVote');
      if (wallet != undefined) {
        wallet.allocatePercentage = parseInt((ledger[entity].quantity * 100) / wallet.balance);
        wallet.allocateQuantity = ledger[entity].quantity;
        wallet.mode = 'EXECUTED';
        Session.set('newVote', wallet);
      }
      return true;
    }
  }
  return false;
};

export const verifyVote = _verifyVote;
export const getWalletVotes = _getWalletVotes;
