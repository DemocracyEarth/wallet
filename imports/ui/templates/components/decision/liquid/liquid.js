import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';

import { sendDelegationVotes } from '/imports/startup/both/modules/Contract';
import { displayModal } from '/imports/ui/modules/modal';
import { Vote } from '/imports/ui/modules/Vote';
import { contractReady, purgeBallot, candidateBallot, getRightToVote } from '/imports/ui/modules/ballot';
import { clearPopups } from '/imports/ui/modules/popup';
import { Contracts } from '/imports/api/contracts/Contracts';

import './liquid.html';
import '../action/action.js';

/**
* @summary converts a percentage value to pixels for current liquid bar
* @param {number} percentage percentage value to be converted
* @param {string} voteId where to store the vote
* @return {number} pixels
*/
function percentageToPixel(percentage, voteId) {
  return parseInt(((percentage * $(`#voteBar-${voteId}`).width()) / 100), 10);
}

/**
* @summary given absolute value returns relative pixel width
* @param {number} value nominal votes to pixel width
* @param {object} bar the item being rendered
* @param {string} voteId session var containing vote info
* @param {boolean} interactive return value from slider
*/
function getBarWidth(value, voteId, editable, interactive) {
  if (editable) {
    const wallet = Session.get(voteId);
    if (wallet !== undefined) {
      if (wallet.balance === 0) { return 0; }
      const percentage = parseFloat((value * 100) / wallet.balance, 10).toFixed(2);
      if (interactive) {
        return `${parseInt(wallet.sliderWidth, 10)}px`;
      }
      return `${percentageToPixel(percentage, voteId)}px`;
    }
  }
  // profile, only logged user
  const wallet = Meteor.user().profile.wallet;
  return `${percentageToPixel(parseFloat((value * 100) / wallet.balance, 10).toFixed(2), voteId)}px`;
}

/**
* @summary verifies vote settings are in onRendered
* @param {Vote} vote
*/
function voteFailure(vote) {
  return (vote.allocateQuantity <= vote.minVotes && vote.minVotes !== 0 && vote.voteType === 'DELEGATION') ||
    (vote.allocateQuantity < vote.minVotes && vote.voteType === 'VOTE') ||
    (vote.allocateQuantity === vote.inBallot) ||
    (vote.voteType === 'VOTE' && purgeBallot(Session.get('candidateBallot')).length === 0) ||
    (isNaN(vote.allocateQuantity));
}

/**
* @summary decides what to display in liquid bar as counterparty value
* @param {string} voteId vote controller for gui
* @param {boolean} editable if its an editable liquid vote
*/
function agreement(voteId, editable) {
  if (Session.get(voteId).voteType === 'BALANCE') {
    return getBarWidth(Session.get(voteId).placed, voteId, true);
  }
  return getBarWidth(parseFloat((Session.get(voteId).placed - Session.get(voteId).inBallot) + Session.get(voteId).delegated, 10), voteId, editable);
}

function getPercentage(value, voteId) {
  return parseFloat((value * 100) / Session.get(voteId).balance, 10);
}

Template.liquid.onCreated(function () {
  const wallet = new Vote(this.data.wallet, this.data.targetId, this.data._id);
  Session.set(this.data._id, wallet);

  if (!Session.get('contract')) {
    Template.instance().contract = new ReactiveVar(Template.currentData().contract);
  } else {
    Template.instance().contract = new ReactiveVar(Contracts.findOne({ _id: Session.get('contract')._id }));
  }

  Template.instance().rightToVote = new ReactiveVar(getRightToVote(Template.instance().contract.get()));
});

Template.liquid.onRendered(function render() {
  if (!Meteor.user()) {
    return;
  }

  const wallet = new Vote(this.data.wallet, this.data.targetId, this.data._id);
  Session.set(this.data._id, wallet);

  // real time update
  Tracker.autorun(() => {
    if (this.data.sourceId === Meteor.userId()) {
      const newWallet = new Vote(Meteor.user().profile.wallet, this.data.targetId, this.data._id);
      newWallet.resetSlider();
      Session.set(this.data._id, newWallet);
    }
  });

  // redraw liquid bar if resize
  $(`#voteBar-${this.data._id}`).resize(function () {
    const voteId = this.id.replace('voteBar-', '');
    $(`#voteSlider-${voteId}`).width(getBarWidth(Session.get(voteId).inBallot, voteId, true));
    $(`#votePlaced-${voteId}`).width(agreement(voteId, true));
  });

  if (this.data.editable) {
    // drag event
    $(`#voteHandle-${this.data._id}`).draggable({
      axis: 'x',
      create() {
        const voteId = this.id.replace('voteHandle-', '');
        this.newVote = new Vote(Session.get(voteId), Session.get(voteId).targetId, voteId);
        Session.set(voteId, this.newVote);
      },
      start(event, ui) {
        const voteId = ui.helper.context.id.replace('voteHandle-', '');
        this.calibrateNewPos = 0;
        this.calibrateCurrentPos = 0;
        this.newVote = new Vote(Session.get(voteId), Session.get(voteId).targetId, voteId);
        Session.set(voteId, this.newVote);
        if (Session.get(voteId) !== undefined) {
          $(`#voteSlider-${voteId}`).velocity('stop');
        }
        if (Session.get('candidateBallot') === undefined && this.newVote.voteType === 'VOTE') {
          if (this.newVote.inBallot > 0) {
            candidateBallot(Meteor.userId());
          }
        }
        Session.set('dragging', voteId);
      },
      drag(event, ui) {
        const voteId = ui.helper.context.id.replace('voteHandle-', '');
        this.newVote.sliderInput(ui.position.left);
        this.calibrateCurrentPos = ui.position.left;
        Session.set(voteId, this.newVote);
        /*
        NOTE: dynamic calibration of slider will be done in the future
        if (this.calibrateCurrentPos !== this.calibrateNewPos) {
          this.timer = Meteor.setTimeout(() => {
            if ((this.calibrateCurrentPos - this.calibrateNewPos) > 10 || (this.calibrateCurrentPos - this.calibrateNewPos) < -10) {
              this.calibrateNewPos = this.calibrateCurrentPos;
              Session.set('liquidDynamicCenter', this.calibrateNewPos);
              Meteor.clearTimeout(this.timer);
            }
          }, timers.LIQUID_CALIBRATION);
        } else {
          Meteor.clearTimeout(this.timer);
        } */
        ui.position.left = 0;
      },
      stop(event, ui) {
        // executes the vote
        const voteId = ui.helper.context.id.replace('voteHandle-', '');

        const cancel = () => {
          if (this.newVote.inBallot === 0 && this.newVote.voteType === 'VOTE') {
            Session.set('candidateBallot', undefined);
          }
          Session.set('dragging', false);
          this.newVote.resetSlider();
          Session.set(voteId, this.newVote);
        };

        Meteor.clearTimeout(this.timer);

        if (voteFailure(this.newVote)) {
          cancel();
          if (this.newVote.voteType === 'VOTE' && (this.newVote.allocateQuantity !== this.newVote.inBallot || this.newVote.inBallot === 0)) {
            Session.set('noSelectedOption', true);
          }
        } else if (contractReady(this.newVote, Template.instance().contract.get()) || this.newVote.voteType === 'DELEGATION') {
          clearPopups();

          // democracy wins
          this.newVote.execute(cancel);
        }
      },
    });
  }
});

Template.liquid.helpers({
  isDelegation() {
    return (Session.get(this._id).voteType === 'DELEGATION');
  },
  rightToVote() {
    return Template.instance().rightToVote.get();
  },
  confirmationRequired() {
    if (Session.get('contract').kind === 'DELEGATION') {
      const signatures = Session.get('contract').signatures;
      for (const i in signatures) {
        if (signatures[i].role === 'DELEGATE' && signatures[i].status === 'PENDING' && signatures[i]._id === Meteor.user()._id) {
          return true;
        }
      }
    }
    return false;
  },
});

Template.liquid.events({
  'click #confirmation'() {
    let counterPartyId;
    for (const stamp in Session.get('contract').signatures) {
      if (Session.get('contract').signatures[stamp]._id !== Meteor.user()._id) {
        counterPartyId = Session.get('contract').signatures[stamp]._id;
      }
    }
    displayModal(
      true,
      {
        icon: 'images/modal-delegation.png',
        title: TAPi18n.__('confirm-delegation-votes'),
        message: TAPi18n.__('confirm-delegation-warning').replace('<quantity>', Session.get('contract').wallet.available),
        cancel: TAPi18n.__('not-now'),
        action: TAPi18n.__('confirm-votes'),
        displayProfile: true,
        profileId: counterPartyId,
      },
      function () {
        const settings = {
          condition: {
            transferable: Session.get('contract').transferable,
            portable: Session.get('contract').portable,
            tags: Session.get('contract').tags,
          },
          currency: 'VOTES',
          kind: Session.get('contract').kind,
          contractId: Session.get('contract')._id, // _getContractId(senderId, receiverId, settings.kind),
        };
        sendDelegationVotes(
          Session.get('contract')._id,
          Session.get('contract').signatures[1]._id,
          Session.get('contract').wallet.available,
          settings,
          'CONFIRMED'
        );
      }
    );
  },
  'click #rejection'() {
    let counterPartyId;
    for (const stamp in Session.get('contract').signatures) {
      if (Session.get('contract').signatures[stamp]._id !== Meteor.user()._id) {
        counterPartyId = Session.get('contract').signatures[stamp]._id;
      }
    }
    displayModal(
      true,
      {
        icon: 'images/modal-delegation.png',
        title: TAPi18n.__('reject-delegation-votes'),
        message: TAPi18n.__('reject-delegation-warning').replace('<quantity>', Session.get('contract').wallet.available),
        cancel: TAPi18n.__('not-now'),
        action: TAPi18n.__('reject-votes'),
        displayProfile: true,
        profileId: counterPartyId,
      },
      function () {
        const settings = {
          condition: {
            transferable: Session.get('contract').transferable,
            portable: Session.get('contract').portable,
            tags: Session.get('contract').tags,
          },
          currency: 'VOTES',
          kind: Session.get('contract').kind,
          contractId: Session.get('contract')._id, // _getContractId(senderId, receiverId, settings.kind),
        };
        sendDelegationVotes(
          Session.get('contract')._id,
          Session.get('contract').signatures[0]._id,
          Session.get('contract').wallet.available,
          settings,
          'REJECTED'
        );
      }
    );
  },
});


Template.capital.helpers({
  getVotes(value) {
    let label;
    let placed;
    let percentagePlaced;
    const inBallot = Session.get(this._id).inBallot;
    if (Session.get(this._id) !== undefined) {
      switch (value) {
        case 'available': {
          if (inBallot === 0) {
            let available;
            if (Session.get(this._id).voteType === 'BALANCE') {
              available = Session.get(this._id).balance;
              if (available === 0) { available = TAPi18n.__('none'); }
              label = `<strong>${available.toLocaleString()}</strong> ${TAPi18n.__('total-votes')}`;
            } else {
              available = parseInt((Session.get(this._id).available + Session.get(this._id).inBallot) - Session.get(this._id).allocateQuantity, 10);
              if (Session.get(this._id).allocateQuantity > 0 && (available <= 0)) {
                label = `<strong>${TAPi18n.__('none')}</strong> ${TAPi18n.__('available-votes')}`;
              } else {
                label = `<strong>${available.toLocaleString()}</strong> ${TAPi18n.__('available-votes')}`;
              }
            }
          }
          break;
        }
        case 'inBallot':
          if (Session.get(this._id).voteType === 'DELEGATION') {
            if (inBallot <= 0) {
              label = `<strong>${TAPi18n.__('no')}</strong> ${TAPi18n.__('sent-votes')}`;
            } else {
              label = `<strong>${inBallot.toLocaleString()}</strong> ${TAPi18n.__('sent-votes')}`;
            }
          } else if (inBallot === 0) {
            label = `<strong>${TAPi18n.__('none')}</strong> ${TAPi18n.__('on-this-ballot')}`;
          } else if (Session.get(this._id).voteType === 'BALANCE') {
            label = `<strong>${Session.get(this._id).balance.toLocaleString()}</strong> ${TAPi18n.__('total-votes')}`;
          } else {
            label = `<strong>${inBallot.toLocaleString()}</strong> ${TAPi18n.__('on-this-ballot')}`;
          }
          break;
        case 'allocateQuantity': {
          const quantity = parseInt(Session.get(this._id)[value] - inBallot, 10);
          if (Math.abs(quantity) === inBallot && (quantity < 0)) {
            label = TAPi18n.__('remove-all-votes');
          } else if (Session.get(this._id).voteType === 'DELEGATION') {
            if (Math.abs(inBallot + quantity) <= Session.get(this._id).minVotes && inBallot > 0) {
              label = TAPi18n.__('votes-in-use');
            } else if (Session.get(this._id).allocateQuantity <= 0 || isNaN(Session.get(this._id).allocateQuantity)) {
              if (Session.get(this._id).available === 0) {
                label = `${TAPi18n.__('not-enough-votes')}`;
              } else {
                label = `<strong>${TAPi18n.__('no')}</strong> ${TAPi18n.__('votes-to-delegate')}`;
              }
            } else {
              label = `<strong>${Math.abs(inBallot + quantity).toLocaleString()}</strong> ${TAPi18n.__('votes-to-delegate')}`;
            }
          } else {
            label = `<strong>${Math.abs(inBallot + quantity).toLocaleString()}</strong> ${TAPi18n.__('place-in-ballot')}`;
          }
          break;
        }
        case 'received':
          label = `<strong>${Session.get(this._id).delegated.toLocaleString()}</strong> ${TAPi18n.__('received-votes')}`;
          break;
        case 'placed':
        default:
          placed = Session.get(this._id).placed;
          percentagePlaced = getPercentage(parseInt(placed - inBallot, 10), this._id);
          if (placed === 0 || percentagePlaced === 0) {
            label = `<strong>${TAPi18n.__('none')}</strong>  ${TAPi18n.__('placed-votes')}`;
          } else if (Session.get(this._id).voteType === 'BALANCE') {
            label = `<strong>${parseInt(getPercentage(Session.get(this._id).placed, this._id), 10).toLocaleString()}%</strong>  ${TAPi18n.__('placed')}`;
          } else if (percentagePlaced < 1 && percentagePlaced > 0) {
            label = `<strong>${TAPi18n.__('less-than-one')}</strong>  ${TAPi18n.__('placed-votes')}`;
          } else {
            label = `<strong>${parseInt(percentagePlaced, 10).toLocaleString()}%</strong>  ${TAPi18n.__('placed-votes')}`;
          }
          break;
      }
    }
    return label;
  },
  style(value) {
    let percentagePlaced;
    const inBallot = Session.get(this._id).inBallot;
    switch (value) {
      case 'available': {
        if (inBallot === 0 && (Session.get('dragging') === false || Session.get('dragging') === undefined || Session.get('dragging') !== this._id)) {
          if (Session.get(this._id).voteType === 'BALANCE') {
            return 'stage-vote-totals';
          }
          const available = parseInt((Session.get(this._id).available + Session.get(this._id).inBallot) - Session.get(this._id).allocateQuantity, 10);
          if ((Session.get(this._id).allocateQuantity > 0 || !Session.get(this._id).allocateQuantity) && (available <= 0)) {
            return 'stage-finish-rejected';
          }
          return 'stage-inballot';
        }
        return 'hide';
      }
      case 'inBallot':
        if (Session.get('dragging') === false || Session.get('dragging') === undefined || Session.get('dragging') !== this._id) {
          if (inBallot === 0) {
            if (Session.get(this._id).voteType === 'DELEGATION') {
              return 'stage-placed';
            }
            return 'hide';
          }
          if (this.editable === false && Session.get(this._id).voteType === 'BALANCE') {
            return 'stage-vote-totals';
          }
          return 'stage-finish-approved';
        }
        return 'hide';
      case 'allocateQuantity': {
        const quantity = parseInt(Session.get(this._id)[value] - inBallot, 10);
        if (Session.get('dragging') === this._id) {
          if ((Math.abs(quantity) === inBallot && (quantity < 0)) ||
          (Math.abs(inBallot + quantity) <= Session.get(this._id).minVotes && inBallot > 0) ||
          (Session.get(this._id).available === 0 && (Session.get(this._id).allocateQuantity <= 0 || isNaN(Session.get(this._id).allocateQuantity)))) {
            return 'stage-finish-rejected';
          }
          return 'stage-live';
        }
        return 'hide';
      }
      case 'placed':
        percentagePlaced = getPercentage(parseInt(Session.get(this._id).placed - inBallot, 10), this._id);
        if (percentagePlaced === 100) {
          return 'stage-finish-rejected';
        }
        if (Session.get(this._id).voteType === 'BALANCE') {
          return 'stage-finish-approved';
        }
        return 'stage-placed';
      case 'received':
        if (Session.get(this._id).delegated === 0) {
          return 'hide';
        }
        return 'stage-delegated';
      default:
        return 'stage-finish-alternative';
    }
  },
  negativeAllocation() {
    return (Session.get(this._id).inBallot > Session.get(this._id).allocateQuantity);
  },
});

Template.bar.helpers({
  available() {
    return getBarWidth(Session.get(this._id).available, this._id, this.editable, true);
  },
  placed() {
    return agreement(this._id, this.editable);
  },
  unanimous(value) {
    const quantity = parseInt(Session.get(this._id)[value] - Session.get(this._id).inBallot, 10);
    if (quantity === Session.get(this._id).balance) {
      return 'unanimous';
    }
    return '';
  },
  fixed(value) {
    if ((Session.get(this._id).delegated > 0 && value === 'placed') || (this.editable === false && value === 'available')) {
      return 'vote-bar-fixed';
    }
    return '';
  },
});
