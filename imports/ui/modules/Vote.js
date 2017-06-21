import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';

import { getDelegationContract, createDelegation } from '/imports/startup/both/modules/Contract';
import { animationSettings } from '/imports/ui/modules/animation';
import { Contracts } from '/imports/api/contracts/Contracts';
import { convertToSlug } from '/lib/utils';
import { purgeBallot, getBallot } from '/imports/ui/modules/ballot';
import { displayNotice } from '/imports/ui/modules/notice';
import { displayModal } from '/imports/ui/modules/modal';
import { transact, getVotes } from '/imports/api/transactions/transaction';

/**
* @summary returns the type of vote being used for the liquid allocation
* @param {string} targetId the id of the targeted element
* @return {string} type VOTE, DELEGATION, UNKNOWN
*/
const _getVoteType = (targetId) => {
  if (targetId === Meteor.userId()) { return 'BALANCE'; }
  const contract = Contracts.findOne({ _id: targetId });
  if (contract) {
    return contract.kind;
  } else if (Meteor.users.findOne({ _id: targetId })) {
    return 'DELEGATION';
  }
  return 'UNKNOWN';
};

/**
* @summary number shall not exceed a set min-max scope.
*/
const _scope = (value, max, min) => {
  let minval = min;
  if (minval === undefined) { minval = 0; }
  if (value < minval) { return minval; } else if (value > max) { return max; }
  return value;
};

/**
* @summary inserts a new vote in the list of state manager
*/
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
* @summary updates the state of all live vote gui
*/
const _updateState = () => {
  const voteList = Session.get('voteList');
  let voteController;
  let newWallet;

  if (!voteList) { return; }

  for (let i = 0; i < voteList.length; i += 1) {
    voteController = Session.get(voteList[i]);
    if (voteController) {
      newWallet = new Vote(Meteor.user().profile.wallet, voteController.targetId, voteList[i]);
      newWallet.resetSlider();
      Session.set(voteList[i], newWallet);
    }
  }
};

/**
* @summary Vote class for transaction operations
*/
export class Vote {
  /**
  * @param {object} wallet - wallet object that can be set from a user's profile.
  * @param {string} targetId - contract being voted
  * @param {string} sessionId - how this wallet will be identified in session
  * @param {string} sourceId - if a vote does not come from user but from a different source.
  */
  constructor(wallet, targetId, sessionId, sourceId) {
    // properties
    if (wallet === undefined) {
      this.address = [];
      this.available = 0;
      this.balance = 0;
      this.placed = 0;
      this.inBallot = 0;
      this.currency = 'VOTES';
    } else {
      Object.assign(this, wallet);
    }
    this.delegated = 0;

    if (sourceId !== undefined) {
      this.userId = sourceId;
      this.arrow = 'INPUT';
    } else {
      this.userId = Meteor.userId();
      this.arrow = 'OUTPUT';
    }

    // defined
    this.initialized = true;
    this.enabled = true;
    this.mode = 'PENDING';
    this.voteType = _getVoteType(targetId);
    this.targetId = targetId;
    this.sourceId = sourceId;
    this.maxVotes = parseInt(this.available + this.inBallot, 10);
    this.minVotes = 0;
    if (this.voteType === 'DELEGATION' && (this.userId !== targetId)) {
      this.delegationContract = getDelegationContract(this.userId, this.targetId);
      if (this.delegationContract) {
        // delegation context
        this.inBallot = getVotes(this.delegationContract._id, this.userId);
        this.delegated = getVotes(this.delegationContract._id, this.targetId);
        this.balance = parseInt(this.inBallot + this.available + this.delegated, 10);
        this.placed = this.inBallot;
        this.maxVotes = parseInt(this.balance - this.delegated, 10);
        if (Meteor.users.findOne({ _id: this.targetId })) {
          this.minVotes = parseInt((this.inBallot - Meteor.users.findOne({ _id: this.targetId }).profile.wallet.available) - 1, 10);
        }
        if (this.minVotes < 0) { this.minVotes = 0; }
      }
    } else if (this.voteType === 'BALANCE') {
      this.inBallot = this.available;
    } else {
      this.inBallot = getVotes(this.targetId, this.userId);
    }
    this.originalTargetId = targetId;

    // view
    if (sessionId && !sourceId) {
      // controller
      this.voteId = `${sessionId}`;

      // gui
      this._initialSliderWidth = parseInt($(`#voteSlider-${this.voteId}`).width(), 10);
      this.sliderWidth = this._initialSliderWidth;
      this._maxWidth = parseInt(($(`#voteBar-${this.voteId}`).width() - (($(`#voteBar-${this.voteId}`).width() * parseInt((((this.placed - this.inBallot) + this.delegated) * 100) / this.balance, 10)) / 100)), 10);
      this._minWidth = parseInt(($(`#voteBar-${this.voteId}`).width() * this.minVotes) / this.balance, 10);
      this.positionHandle(this._initialSliderWidth);

      // methods
      if (this.initialized === true && this.voteType !== 'BALANCE') {
        this.resetSlider();
        this.initialized = false;
      }

      // state manager
      this.requireConfirmation = true;
      _insertVoteList(this, this.voteId);
    } else {
      this.requireConfirmation = false;
      this.voteId = `${this.targetId}`;
    }
  }

  /**
  * @summary allocate N amount of votes and display values accordingly
  * @param {number} quantity amount of votes
  * @param {boolean} avoidSlider disable updating slider length
  */
  place(quantity, avoidSlider) {
    if (this.enabled) {
      this.placedPercentage = ((this.placed * 100) / this.balance);
      this.allocatePercentage = ((quantity * 100) / this.balance);
      this.allocateQuantity = parseInt(_scope(quantity, this.maxVotes), 10); // used to have instead of maxvotes : (this.available + this.inBallot)
    }
    if (!avoidSlider) {
      const sliderWidth = parseFloat(($(`#voteSlider-${this.voteId}`).width() * this.available) / this._maxWidth, 10);
      const sliderCorrected = parseFloat((this._maxWidth * this.allocateQuantity) / this.available, 10);
      this.sliderInput((sliderCorrected - sliderWidth), true);
    }
  }

  /**
  * @summary returns original position of slider
  */
  _getSliderCenter(pixels) {
    if (pixels > 0) {
      return parseInt($(`#voteSlider-${this.voteId}`).width() - pixels, 10);
    }
    return parseInt($(`#voteSlider-${this.voteId}`).width() + Math.abs(pixels), 10);
  }

  /**
  * @summary given an input in pixels defines the values of wallet
  * @param {number} pixels length in pixels
  * @param {boolean} avoidAllocation disable updating wallet values
  */
  sliderInput(pixels, avoidAllocation) {
    let pixelToVote;
    let remainingSpace;
    let remainingVotes;
    let sliderInRemainingSpace;
    let inputPixels = pixels;
    if (pixels === undefined) { inputPixels = 0; }
    const MAX_VOTES_PRECISION = 10;
    const MAX_PERCENTAGE_PRECISION = 7;
    const barWidth = $(`#voteBar-${this.voteId}`).width();
    const placedWidth = $(`#votePlaced-${this.voteId}`).width();
    const precisionRange = parseInt((MAX_PERCENTAGE_PRECISION * barWidth) / 100, 10);
    const precisionValue = parseInt((inputPixels * MAX_VOTES_PRECISION) / precisionRange, 10);

    /*
    NOTE: dynamic calibration of bar for precise range while subtle sliding anywhere will be done in the future
    let calibrate = 0;
    if (Session.get('liquidDynamicCenter') !== undefined) {
      calibrate = Session.get('liquidDynamicCenter');
      inputPixels += calibrate; // testing
    }
    */

    if ($(`#voteBar-${this.voteId}`).offset() !== undefined) {
      if ($(`#voteHandle-${this.voteId}`).offset() !== undefined) {
        this.sliderWidth = _scope((this._initialSliderWidth + inputPixels), this._maxWidth, this._minWidth);
      } else {
        this.sliderWidth = 0;
      }
      this.positionHandle(this.sliderWidth);
      if (!avoidAllocation) {
        if (Math.abs(inputPixels) <= precisionRange) {
          // precise allocation based on small pixel movement
          pixelToVote = _scope(parseInt((precisionValue * this.balance) / barWidth, 10), this.maxVotes, this.minVotes);
          this.place(this.inBallot + precisionValue, true);
        } else {
          // standard allocation based on relative slider pixel width
          if (inputPixels > 0) {
            remainingSpace = parseInt(barWidth - precisionRange - placedWidth - this._getSliderCenter(inputPixels), 10);
            remainingVotes = parseInt(this.maxVotes - this.inBallot, 10);
            sliderInRemainingSpace = parseInt(inputPixels - precisionRange, 10);
            pixelToVote = _scope(parseInt((sliderInRemainingSpace * remainingVotes) / remainingSpace, 10) + MAX_VOTES_PRECISION + this.inBallot, this.maxVotes, this.minVotes);
          } else {
            remainingSpace = parseInt(this._getSliderCenter(inputPixels) - precisionRange - parseInt((this.minVotes * barWidth) / this.balance, 10), 10);
            remainingVotes = parseInt(this.inBallot - this.minVotes - MAX_VOTES_PRECISION, 10);
            sliderInRemainingSpace = parseInt(Math.abs(inputPixels) - precisionRange, 10);
            pixelToVote = _scope(this.inBallot - MAX_VOTES_PRECISION - parseInt((sliderInRemainingSpace * remainingVotes) / remainingSpace, 10), this.maxVotes, this.minVotes);
          }
          this.place(pixelToVote, true);
        }
      }
    }
  }

  /**
  * @summary resets slider handle to current inBallot value position
  */
  resetSlider() {
    const initialValue = parseFloat((this.inBallot * 100) / this.balance, 10).toFixed(2);
    $(`#voteSlider-${this.voteId}`).velocity({ width: `${initialValue}%` }, animationSettings);
    this._initialSliderWidth = parseInt(($(`#voteBar-${this.voteId}`).width() * initialValue) / 100, 10);
    this.sliderWidth = this._initialSliderWidth;
    this.positionHandle(this.sliderWidth);
    this.place(this.inBallot, true);
  }

  /**
  * @summary position handle to properly fit in the extremes
  */
  positionHandle(width) {
    $(`#voteHandle-${this.voteId}`).css('margin-right', `${parseInt(((width * 23) / $(`#voteBar-${this.voteId}`).width()) - 29, 10)}px`);
  }

  /**
  * @summary returns the type of object (contract or user) based on wallet info
  * @param {string} contractId
  * @return {object} contract
  */
  _getContract(contractId) {
    let contract;
    switch (this.voteType) {
      case 'DELEGATION':
        contract = Contracts.findOne({ _id: contractId });
        if (!contract) {
          return Meteor.users.findOne({ _id: contractId });
        }
        return contract;
      case 'VOTE':
      default:
        return Contracts.findOne({ _id: contractId });
    }
  }

  _getSigner(signatures) {
    let signer;
    for (let i = 0; i < signatures.length; i += 1) {
      signer = Meteor.users.findOne({ _id: signatures[i]._id });
      if (signer && signer._id !== this.userId) { return signer._id; }
    }
    return undefined;
  }

  /**
  * @summary executes an already configured vote from a liquid bar
  * @param {function} callback callback if execution is cancelled or after vote if no sessionId
  * @param {boolean} removal if operation aims to remove all votes from ballot
  */
  execute(callback, removal) {
    let vote;
    let showBallot;
    let finalBallot;
    let finalCaption;
    let settings;
    let iconPic;
    let actionLabel;
    let titleLabel;
    let boolProfile;
    let dictionary;
    let delegateProfileId;
    const target = this._getContract(this.targetId);
    const votesInBallot = this.inBallot;
    const newVotes = parseInt(this.allocateQuantity - votesInBallot, 10);
    const votes = parseInt(votesInBallot + newVotes, 10);

    const close = () => {
      if (this.requireConfirmation) {
        Session.set('dragging', false);
        const newWallet = new Vote(Meteor.users.findOne({ _id: this.userId }).profile.wallet, Session.get(this.voteId).targetId, this.voteId);
        Session.set(this.voteId, newWallet);
      }
    };

    switch (this.voteType) {
      case 'DELEGATION':
        settings = {
          condition: {
            transferable: true,
            portable: true,
            tags: [],
          },
          currency: 'VOTES',
          kind: 'DELEGATION',
        };

        if (this.delegationContract) {
          // there was a delegation already
          delegateProfileId = this._getSigner(this.delegationContract.signatures);
          settings.title = this.delegationContract.title;
          settings.signatures = this.delegationContract.signatures;
          settings.contractId = this.delegationContract._id;
        } else {
          // no delegation
          delegateProfileId = this.targetId;
          settings.title = `${convertToSlug(Meteor.users.findOne({ _id: this.userId }).username)}-${convertToSlug(Meteor.users.findOne({ _id: this.targetId }).username)}`;
          settings.signatures = [{ username: Meteor.users.findOne({ _id: this.userId }).username }, { username: Meteor.users.findOne({ _id: this.targetId }).username }];
          this.delegationContract = createDelegation(this.userId, this.targetId, 0, settings, close);
          settings.contractId = this.delegationContract._id;
        }

        switch (this.arrow) {
          case 'INPUT':
            this.targetId = this.userId;
            this.userId = this.delegationContract._id;
            break;
          case 'OUTPUT':
          default:
            this.targetId = this.delegationContract._id;
            break;
        }

        iconPic = 'images/modal-delegation.png';
        titleLabel = TAPi18n.__('send-delegation-votes');
        actionLabel = TAPi18n.__('delegate');
        boolProfile = true;
        showBallot = false;
        dictionary = 'delegations';

        break;
      case 'VOTE':
      default:
        iconPic = 'images/modal-vote.png';
        titleLabel = TAPi18n.__('place-vote');
        actionLabel = TAPi18n.__('vote');
        boolProfile = false;
        showBallot = true;
        finalBallot = purgeBallot(getBallot(this.targetId)); // purgeBallot(Session.get('candidateBallot'));
        dictionary = 'votes';
        settings = {
          condition: {
            tags: target.tags,
            ballot: finalBallot,
          },
          currency: 'VOTES',
          kind: target.kind,
          contractId: this.targetId,
        };

        if (finalBallot.length === 0 && removal !== true) {
          displayNotice('empty-values-ballot', true);
          return;
        }
        break;
    }

    // voting cases

    if (newVotes < 0 || votes === 0 || removal === true) {
      // subtract votes

      if (votes === 0) {
        finalCaption = TAPi18n.__(`retrieve-all-${dictionary}`);
        showBallot = false;
        actionLabel = TAPi18n.__('remove');
      } else {
        finalCaption = TAPi18n.__(`retrieve-${dictionary}-warning`).replace('<quantity>', votes.toString()).replace('<retrieve>', Math.abs(newVotes).toString());
      }
      vote = () => {
        const tx = transact(
          this.targetId,
          this.userId,
          parseInt(Math.abs(newVotes), 10),
          settings,
          close
        );
        if (tx) { _updateState(); }
        return tx;
      };
    } else if ((votesInBallot === 0) || (newVotes === 0)) {
      // insert votes

      let voteQuantity;
      if (newVotes === 0) {
        finalCaption = TAPi18n.__('place-votes-change-ballot').replace('<quantity>', this.allocateQuantity);
        voteQuantity = 0;
      } else {
        finalCaption = TAPi18n.__(`place-${dictionary}-warning`).replace('<quantity>', this.allocateQuantity);
        voteQuantity = parseInt(this.allocateQuantity, 10);
      }
      vote = () => {
        const tx = transact(
          this.userId,
          this.targetId,
          voteQuantity,
          settings,
          close
        );
        if (tx) { _updateState(); }
        return tx;
      };
    } else if (newVotes > 0) {
      // add votes

      finalCaption = TAPi18n.__(`place-more-${dictionary}-warning`).replace('<quantity>', votes.toString()).replace('<add>', newVotes);
      vote = () => {
        const tx = transact(
          this.userId,
          this.targetId,
          parseInt(newVotes, 10),
          settings,
          close
        );
        if (tx) { _updateState(); }
        return tx;
      };
    }

    if (this.requireConfirmation) {
      displayModal(
        true,
        {
          icon: iconPic,
          title: titleLabel,
          message: finalCaption,
          cancel: TAPi18n.__('not-now'),
          action: actionLabel,
          displayProfile: boolProfile,
          displayBallot: showBallot,
          ballot: finalBallot,
          profileId: delegateProfileId,
        },
        vote,
        callback
      );
    } else {
      const v = vote();
      if (v) {
        _updateState();
        if (callback) { callback(); }
      }
      return v;
    }
  }
}

export const updateState = _updateState;
