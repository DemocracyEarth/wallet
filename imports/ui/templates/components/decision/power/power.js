import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';

import { sendDelegationVotes } from '/imports/startup/both/modules/Contract';
import { displayModal } from '/imports/ui/modules/modal';
import { Vote } from '/imports/ui/modules/Vote';
import { contractReady, purgeBallot, candidateBallot } from '/imports/ui/modules/ballot';
import { clearPopups } from '/imports/ui/modules/popup';

import './power.html';
import '../action/action.js';

/**
* @summary converts a percentage value to pixels for current power bar
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
      const percentage = parseFloat((value * 100) / wallet.balance, 10).toFixed(2);
      if (value === 0) {
        return '0px';
      } else if (interactive) {
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
* @summary decides what to display in liquid bar as counterparty value
* @param {string} voteId vote controller for gui
* @param {boolean} editable if its an editable liquid vote
*/
function agreement(voteId, editable) {
  if (Session.get(voteId).voteType === 'BALANCE') {
    return getBarWidth(Session.get(voteId).placed, voteId, true);
  } if (Session.get(voteId).delegated > 0) {
    // return getBarWidth(parseFloat(Session.get(voteId).delegated, 10), voteId, editable);
  }
  return getBarWidth(parseFloat((Session.get(voteId).placed - Session.get(voteId).inBallot) + Session.get(voteId).delegated, 10), voteId, editable);
}

Template.power.onCreated(function () {
  const wallet = new Vote(this.data.wallet, this.data.targetId, this.data._id);
  Session.set(this.data._id, wallet);
});

Template.power.onRendered(function render() {
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

  // redraw power bar if resize
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
        this.newVote = new Vote(Session.get(voteId), Session.get(voteId).targetId, voteId);
        Session.set(voteId, this.newVote);
        if (Session.get(voteId) !== undefined) {
          $(`#voteSlider-${voteId}`).velocity('stop');
        }
        if (Session.get('candidateBallot') === undefined) {
          candidateBallot(Meteor.userId());
        }
        Session.set('dragging', voteId);
      },
      drag(event, ui) {
        const voteId = ui.helper.context.id.replace('voteHandle-', '');
        this.newVote.sliderInput(ui.position.left);
        Session.set(voteId, this.newVote);
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

        if ((this.newVote.allocateQuantity === 0 && this.newVote.inBallot === 0) || (this.newVote.voteType === 'VOTE' && purgeBallot(Session.get('candidateBallot')).length === 0)) {
          cancel();
          if (this.newVote.voteType === 'VOTE') {
            Session.set('noSelectedOption', true);
          }
        } else if (contractReady(this.newVote) || this.newVote.voteType === 'DELEGATION') {
          clearPopups();

          // democracy wins
          this.newVote.execute(cancel);
        }
      },
    });
  }
});

Template.power.helpers({
  isDelegation() {
    return (Session.get(this._id).voteType === 'DELEGATION');
  },
  rightToVote() {
    return Session.get('rightToVote');
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

Template.power.events({
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
    const inBallot = Session.get(this._id).inBallot;
    if (Session.get(this._id) !== undefined) {
      switch (value) {
        case 'available': {
          if (inBallot === 0) {
            let available;
            if (Session.get(this._id).voteType === 'BALANCE') {
              available = Session.get(this._id).available;
              if (available === 0) { available = TAPi18n.__('none'); }
            } else {
              available = parseInt((Session.get(this._id).available + Session.get(this._id).inBallot) - Session.get(this._id).allocateQuantity, 10);
            }
            if (Session.get(this._id).allocateQuantity > 0 && (available <= 0)) {
              label = `<strong>${TAPi18n.__('none')}</strong> ${TAPi18n.__('available-votes')}`;
            } else {
              label = `<strong>${available.toLocaleString()}</strong> ${TAPi18n.__('available-votes')}`;
            }
          }
          break;
        }
        case 'inBallot':
          if (Session.get(this._id).voteType === 'DELEGATION') {
            if (inBallot === 0) {
              label = `<strong>${TAPi18n.__('no')}</strong> ${TAPi18n.__('delegated-votes')}`;
            } else {
              label = `<strong>${inBallot.toLocaleString()}</strong> ${TAPi18n.__('delegated-votes')}`;
            }
          } else if (inBallot === 0) {
            label = `<strong>${TAPi18n.__('none')}</strong> ${TAPi18n.__('on-this-ballot')}`;
          } else if (Session.get(this._id).voteType === 'BALANCE') {
            label = `<strong>${inBallot.toLocaleString()}</strong> ${TAPi18n.__('available-votes')}`;
          } else {
            label = `<strong>${inBallot.toLocaleString()}</strong> ${TAPi18n.__('on-this-ballot')}`;
          }
          break;
        case 'allocateQuantity': {
          const quantity = parseInt(Session.get(this._id)[value] - inBallot, 10);
          if (Math.abs(quantity) === inBallot && (quantity < 0)) {
            label = TAPi18n.__('remove-all-votes');
          } else if (Session.get(this._id).voteType === 'DELEGATION') {
            label = `<strong>${Math.abs(inBallot + quantity).toLocaleString()}</strong> ${TAPi18n.__('votes-to-delegate')}`;
          } else {
            label = `<strong>${Math.abs(inBallot + quantity).toLocaleString()}</strong> ${TAPi18n.__('place-in-ballot')}`;
          }
          break;
        }
        case 'placed':
        default:
          if (Meteor.user().profile.wallet.placed === 0) {
            label = `<strong>${TAPi18n.__('none')}</strong>  ${TAPi18n.__('placed-votes')}`;
          } else if (Session.get(this._id).voteType === 'BALANCE') {
            label = `<strong>${Meteor.user().profile.wallet.placed.toLocaleString()}</strong>  ${TAPi18n.__('placed')}`;
          } else {
            label = `<strong>${parseInt(Meteor.user().profile.wallet.placed - inBallot, 10).toLocaleString()}</strong>  ${TAPi18n.__('placed-votes')}`;
          }
          break;
      }
    }
    return label;
  },
  style(value) {
    const inBallot = Session.get(this._id).inBallot;
    switch (value) {
      case 'available': {
        if (inBallot === 0 && (Session.get('dragging') === false || Session.get('dragging') === undefined || Session.get('dragging') !== this._id)) {
          const available = parseInt((Session.get(this._id).available + Session.get(this._id).inBallot) - Session.get(this._id).allocateQuantity, 10);
          if (Session.get(this._id).allocateQuantity > 0 && (available <= 0)) {
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
          return 'stage-finish-approved';
        }
        return 'hide';
      case 'allocateQuantity': {
        const quantity = parseInt(Session.get(this._id)[value] - inBallot, 10);
        if (Session.get('dragging') === this._id) {
          if (Math.abs(quantity) === inBallot && (quantity < 0)) {
            return 'stage-finish-rejected';
          }
          return 'stage-live';
        }
        return 'hide';
      }
      case 'placed':
        return 'stage-placed';
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
    if (Session.get(this._id)[value] === Session.get(this._id).balance) {
      return 'unanimous';
    }
    return '';
  },
});
