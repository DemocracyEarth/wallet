import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';

import { userVotesInContract } from '/imports/startup/both/modules/User';
import { getDelegationContract, delegate } from '/imports/startup/both/modules/Contract';
import { animationSettings } from '/imports/ui/modules/animation';
import { Contracts } from '/imports/api/contracts/Contracts';
import { convertToSlug } from '/lib/utils';
import { purgeBallot } from '/imports/ui/modules/ballot';
import { displayNotice } from '/imports/ui/modules/notice';
import { displayModal } from '/imports/ui/modules/modal';
import { transact } from '/imports/api/transactions/transaction';

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
      newWallet = new Vote(Meteor.user().profile.wallet, voteController.originalTargetId, voteList[i]);
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

    // view
    if (sessionId) {
      // controller
      this.voteId = `${sessionId}`;

      // gui
      this._initialSliderWidth = parseInt($(`#voteSlider-${this.voteId}`).width(), 10);
      this.sliderWidth = this._initialSliderWidth;
      this._maxWidth = parseInt(($(`#voteBar-${this.voteId}`).width() - (($(`#voteBar-${this.voteId}`).width() * parseInt(((this.placed - this.inBallot) * 100) / this.balance, 10)) / 100)), 10);

      // methods
      if (this.initialized === true) {
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
      this.allocateQuantity = parseInt(_scope(quantity, (this.available + this.inBallot)), 10);
    }
    if (!avoidSlider) {
      const sliderWidth = parseFloat(($(`#voteSlider-${this.voteId}`).width() * this.available) / this._maxWidth, 10);
      const sliderCorrected = parseFloat((this._maxWidth * this.allocateQuantity) / this.available, 10);
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
        this.place(pixelToVote, true);
      }
    }
  }

  /**
  * @summary defines the percentage of slider length
  */
  sliderPercentage() {
    this.allocatePercentage = parseInt((this.allocateQuantity * 100) / this.balance, 10);
    this.place(this.allocateQuantity);
  }

  /**
  * @summary resets slider handle to current inBallot value position
  * @param {boolean} doPlaced if also reset the placed value of power bar
  */
  resetSlider() {
    const initialValue = parseFloat((this.inBallot * 100) / this.balance, 10).toFixed(2);
    $(`#voteSlider-${this.voteId}`).velocity({ width: `${initialValue}%` }, animationSettings);
    this._initialSliderWidth = parseInt(($(`#voteBar-${this.voteId}`).width() * initialValue) / 100, 10);
    this.sliderWidth = this._initialSliderWidth;
    this.place(this.inBallot, true);
  }

  /**
  * @summary returns the type of object (contract or user) based on wallet info
  * @return {object} contract
  */
  _getTargetObject() {
    let contract;
    switch (this.voteType) {
      case 'DELEGATION':
        contract = Contracts.findOne({ _id: this.targetId });
        if (!contract) {
          return Meteor.users.findOne({ _id: this.targetId });
        }
        return contract;
      case 'VOTE':
      default:
        return Contracts.findOne({ _id: this.targetId });
    }
  }

  /**
  * @summary executes an already configured vote from a power bar
  * @param {Wallet} wallet where the vote to be executed takes its input from
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
    let delegateUser;
    let delegateContractTitle;
    let delegateProfileId;
    const target = this._getTargetObject();
    const votesInBallot = this.inBallot;
    const newVotes = parseInt(this.allocateQuantity - votesInBallot, 10);
    const votes = parseInt(votesInBallot + newVotes, 10);

    const close = () => {
      if (this.requireConfirmation) {
        Session.set('dragging', false);
        const newWallet = new Vote(Meteor.user().profile.wallet, Session.get(this.voteId).targetId, this.voteId);
        Session.set(this.voteId, newWallet);
      }
    };

    // TODO delegation use case, only thought for contracts still.

    switch (this.voteType) {
      case 'DELEGATION':
        if (target.signatures) {
          for (let i = 0; i < target.signatures.length; i += 1) {
            delegateUser = Meteor.users.findOne({ _id: target.signatures[i]._id });
            if (delegateUser && delegateUser._id !== Meteor.userId()) { break; }
          }
          delegateContractTitle = target.title;
        } else {
          delegateUser = target;
          delegateContractTitle = `${convertToSlug(Meteor.user().username)}-${convertToSlug(delegateUser.username)}`;
        }
        delegateProfileId = delegateUser._id;
        iconPic = 'images/modal-delegation.png';
        titleLabel = TAPi18n.__('send-delegation-votes');
        actionLabel = TAPi18n.__('delegate');
        boolProfile = true;
        showBallot = false;
        dictionary = 'delegations';

        // NOTE: this stuff is legacy, should definitely be reviewed ASAP
        settings = {
          title: delegateContractTitle,
          signatures: [
            {
              username: Meteor.user().username,
            },
            {
              username: delegateUser.username,
            },
          ],
          condition: {
            transferable: Session.get('contract').transferable,
            portable: Session.get('contract').portable,
            tags: Session.get('contract').tags,
          },
          currency: 'VOTES',
          kind: Session.get('contract').kind,
          contractId: Session.get('contract')._id,
        };
        break;
      case 'VOTE':
      default:
        iconPic = 'images/modal-vote.png';
        titleLabel = TAPi18n.__('place-vote');
        actionLabel = TAPi18n.__('vote');
        boolProfile = false;
        showBallot = true;
        finalBallot = purgeBallot(Session.get('candidateBallot'));
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
        transact(
          this.targetId,
          Meteor.user()._id,
          parseInt(Math.abs(newVotes), 10),
          settings,
          close
        );
        _updateState();
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
        switch (this.voteType) {
          case 'DELEGATION':
            delegate(
              Meteor.userId(),
              delegateUser._id,
              voteQuantity,
              settings,
              close
            );
            break;
          case 'VOTE':
          default:
            transact(
              Meteor.user()._id,
              this.targetId,
              voteQuantity,
              settings,
              close
            );
        }
        _updateState();
      };
    } else if (newVotes > 0) {
      // add votes
      finalCaption = TAPi18n.__(`place-more-${dictionary}-warning`).replace('<quantity>', votes.toString()).replace('<add>', newVotes);
      vote = () => {
        transact(
          Meteor.user()._id,
          this.targetId,
          parseInt(newVotes, 10),
          settings,
          close
        );
        _updateState();
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
      vote();
      if (callback) { callback(); }
    }
  }
}
