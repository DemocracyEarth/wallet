import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { userVotesInContract } from '/imports/startup/both/modules/User';

/**
* @summary Wallet class for transaction operations
* @param {object} wallet - wallet object that can be set from a user's profile.
* @constructor {object} Wallet - constructor function
*/
export const Wallet = function (wallet, contract) {
  // properties
  if (wallet === undefined) {
    this.address = [];
    this.ledger = [];
    this.available = 0;
    this.balance = 0;
    this.placed = 0;
    this.currency = 'VOTES';
  } else {
    Object.assign(this, wallet);
  }

  // private
  this.initialized = true;
  this.enabled = true;
  this.mode = 'PENDING';

  // controller
  if (contract === undefined) {
    this.voteId = '';
  } else {
    this.voteId = `${contract}`;
  }

  // view
  this._initialSliderWidth = $(`#voteSlider-${this.voteId}`).width();
  this.sliderWidth = this._initialSliderWidth;
  this._maxWidth = $(`#voteBar-${this.voteId}`).width() - (($(`#voteBar-${this.voteId}`).width() * parseInt((this.placed * 100) / this.balance, 10)) / 100) - 2;

  // methods
  if (this.initialized === true) {
    // this.allocateVotes(parseInt((this.available * 10) / 100, 10));
    this.allocateVotes(userVotesInContract(Meteor.user().profile.wallet, contract));
    this.initialized = false;
  }

  // reaction
  Session.set(`vote-${this.voteId}`, this);
};

const _scope = (value, max, min) => {
  let minval = min;
  if (minval === undefined) { minval = 0; }
  if (value < minval) { return minval; } else if (value > max) { return max; }
  return value;
};

Wallet.prototype.allocateVotes = function (quantity, avoidSlider) {
  if (this.enabled) {
    this.placedPercentage = ((this.placed * 100) / this.balance);
    this.allocatePercentage = ((quantity * 100) / this.balance);
    this.allocateQuantity = _scope(quantity, this.available);
  }
  if (!avoidSlider) {
    const sliderWidth = parseInt(($(`#voteSlider-${this.voteId}`).width() * this.available) / this._maxWidth, 10);
    const sliderCorrected = parseInt((this._maxWidth * this.allocateQuantity) / this.available, 10);
    this.sliderInput((sliderCorrected - sliderWidth), true);
  }
};

Wallet.prototype.sliderInput = function (pixels, avoidAllocation) {
  if (pixels === undefined) { pixels = 0; }
  if ($(`#voteHandle-${this.voteId}`).offset() !== undefined) {
    // var percentage = (($(`#voteHandle-${this.voteId}`).offset().left - $(`#voteBar-${this.voteId}`).offset().left) * 100) / $(`#voteBar-${this.voteId}`).width();
    var delta = ($(`#voteBar-${this.voteId}`).offset().left + this._maxWidth) - $(`#voteBar-${this.voteId}`).offset().left - ($(`#voteHandle-${this.voteId}`).width() / 2);
    var votes = parseInt(((this.sliderWidth - + ($(`#voteHandle-${this.voteId}`).width() / 2)) * this.available) / delta, 10);
    this.sliderWidth = _scope((this._initialSliderWidth + pixels), this._maxWidth, ($(`#voteHandle-${this.voteId}`).width() / 2));
  } else {
    console.log('EY');
    this.sliderWidth = 0;
  }
  if (!avoidAllocation) {
    this.allocateVotes(votes, true);
  }
};

Wallet.prototype.sliderPercentage = function () {
  this.allocatePercentage = parseInt((this.allocateQuantity * 100) / this.balance, 10);
  this.allocateVotes(this.allocateQuantity);
};

/**
* @summary verify if user has already voted
* @param {object} ledger - ledger of contract or entity to verify on
* @param {string} userId - id of user
* @return {boolean} value - true or false
*/
const _verifyVote = (ledger, userId) => {
  for (const entity in ledger) {
    if (ledger[entity].entityId === userId) {
      const wallet = Session.get('newVote');
      if (wallet !== undefined) {
        wallet.allocatePercentage = parseInt((ledger[entity].quantity * 100) / wallet.balance, 10);
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
