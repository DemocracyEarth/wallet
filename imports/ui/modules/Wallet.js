import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { userVotesInContract } from '/imports/startup/both/modules/User';
import { getDelegationContract } from '/imports/startup/both/modules/Contract';
import { animationSettings } from '/imports/ui/modules/animation';
import { Contracts } from '/imports/api/contracts/Contracts';

/**
* @summary returns the type of vote being used for the power allocation
* @param {string} targetId the id of the targeted element
* @return {string} type VOTE, DELEGATION, UNKNOWN
*/
const _getVoteType = (targetId) => {
  const contract = Contracts.findOne({ _id: targetId });
  if (contract) {
    return contract.kind;
  } else if (Meteor.users.findOne({ _id: targetId })) {
    return 'DELEGATION';
  }
  return 'UNKNOWN';
};

const _scope = (value, max, min) => {
  let minval = min;
  if (minval === undefined) { minval = 0; }
  if (value < minval) { return minval; } else if (value > max) { return max; }
  return value;
};

const _insertVoteList = (wallet, id) => {
  let voteList = [];
  let found = false;

  if (Session.get('voteList')) {
    voteList = Session.get('voteList');
    for (let i = 0; i < voteList.length; i += 1) {
      if (voteList[i] === id) {
        found = true;
        break;
      }
    }
  }
  if (!found) {
    voteList.push(id);
  }

  Session.set('voteList', voteList);
};

/**
* @summary Wallet class for transaction operations
*/
export class Wallet {
  /**
  * @constructor constructor function
  * @param {object} wallet - wallet object that can be set from a user's profile.
  * @param {string} targetId - contrct being used for this vote
  * @param {string} sessionId - how this wallet will be identified on a session var
  */
  constructor(wallet, targetId, sessionId) {
    // properties
    if (wallet === undefined) {
      this.address = [];
      this.ledger = [];
      this.available = 0;
      this.balance = 0;
      this.placed = 0;
      this.inBallot = 0;
      this.currency = 'VOTES';
    } else {
      Object.assign(this, wallet);
    }

    // defined
    this.initialized = true;
    this.enabled = true;
    this.mode = 'PENDING';
    this.voteType = _getVoteType(targetId);
    this.targetId = targetId;
    if (this.voteType === 'DELEGATION') {
      const delegationContract = getDelegationContract(Meteor.userId(), targetId);
      if (delegationContract) {
        this.targetId = delegationContract._id;
      }
    }
    this.originalTargetId = targetId;
    this.inBallot = userVotesInContract(wallet, this.targetId);

    // controller
    if (sessionId === undefined) {
      this.voteId = `${this.targetId}`;
    } else {
      this.voteId = `${sessionId}`;
    }

    // view
    this._initialSliderWidth = parseInt($(`#voteSlider-${this.voteId}`).width(), 10);
    this.sliderWidth = this._initialSliderWidth;
    // TODO remove 5 pixels for buffer?
    this._maxWidth = parseInt(($(`#voteBar-${this.voteId}`).width() - (($(`#voteBar-${this.voteId}`).width() * parseInt(((this.placed - this.inBallot) * 100) / this.balance, 10)) / 100)), 10);

    // methods
    if (this.initialized === true) {
      this.resetSlider();
      this.initialized = false;
    }

    // session list
    _insertVoteList(this, this.voteId);
  }

  /**
  * @summary allocate N amount of votes and display values accordingly
  * @param {number} quantity amount of votes
  * @param {boolean} avoidSlider disable updating slider length
  */
  allocateVotes(quantity, avoidSlider) {
    if (this.enabled) {
      this.placedPercentage = ((this.placed * 100) / this.balance);
      this.allocatePercentage = ((quantity * 100) / this.balance);
      this.allocateQuantity = parseInt(_scope(quantity, (this.available + this.inBallot)), 10);
    }
    if (!avoidSlider) {
      const sliderWidth = parseFloat(($(`#voteSlider-${this.voteId}`).width() * this.available) / this._maxWidth, 10);
      const sliderCorrected = parseFloat(
        (this._maxWidth * this.allocateQuantity) / this.available, 10);
      this.sliderInput((sliderCorrected - sliderWidth), true);
    }
  }

  /**
  * @summary given an input in pixels defines the values of wallet
  * @param {number} pixels length in pixels
  * @param {boolean} avoidAllocation disable updating wallet values
  */
  sliderInput(pixels, avoidAllocation) {
    let inputPixels = pixels;
    if (pixels === undefined) { inputPixels = 0; }
    if ($(`#voteBar-${this.voteId}`).offset() !== undefined) {
      if ($(`#voteHandle-${this.voteId}`).offset() !== undefined) {
        this.sliderWidth = _scope((this._initialSliderWidth + inputPixels), this._maxWidth, 0);
      } else {
        this.sliderWidth = 0;
      }
      if (!avoidAllocation) {
        const sliderWidth = _scope($(`#voteSlider-${this.voteId}`).width(), this._maxWidth, 0);
        const barWidth = $(`#voteBar-${this.voteId}`).width();
        const pixelToVote = _scope(parseInt(
          (sliderWidth * this.balance) / barWidth, 10), (this.available + this.inBallot), 0);
        this.allocateVotes(pixelToVote, true);
      }
    }
  }

  /**
  * @summary defines the percentage of slider length
  */
  sliderPercentage() {
    this.allocatePercentage = parseInt((this.allocateQuantity * 100) / this.balance, 10);
    this.allocateVotes(this.allocateQuantity);
  }

  /**
  * @summary resets slider handle to current inBallot value position
  */
  resetSlider() {
    console.log('resetSlider()');
    const initialValue = parseFloat((this.inBallot * 100) / this.balance, 10).toFixed(2);
    $(`#voteSlider-${this.voteId}`).velocity({ width: `${initialValue}%` }, animationSettings);
    this._initialSliderWidth = parseInt(($(`#voteBar-${this.voteId}`).width() * initialValue) / 100, 10);
    this.sliderWidth = this._initialSliderWidth;
    this.allocateVotes(this.inBallot, true);
  }

  /**
  * @summary updates a session var if present with wallet info
  */
  refresh() {
    if (Session.get(this.voteId)) {
      const newWallet = new Wallet(this, this.targetId, this.voteId);
      Session.set(this.voteId, newWallet);
    }
  }
}

const _updateState = () => {
  const voteList = Session.get('voteList');
  let voteController;
  let newWallet;

  if (!voteList) { return; }

  for (let i = 0; i < voteList.length; i += 1) {
    voteController = Session.get(voteList[i]);
    if (voteController) {
      newWallet = new Wallet(Meteor.user().profile.wallet, voteController.originalTargetId, voteList[i]);
      if (voteList[i] === 'vote-hs52pDTPmMyowj2Wd-pzwgWWZNpAKQM2jvi') {
        console.log('RESETTING:');
        console.log(newWallet);
        newWallet.resetSlider();
        console.log(newWallet);
      }
      Session.set(voteList[i], newWallet);
    }
  }
};

export const updateState = _updateState;
