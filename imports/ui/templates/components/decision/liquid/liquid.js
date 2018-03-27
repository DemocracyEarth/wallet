import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { ReactiveVar } from 'meteor/reactive-var';

import { sendDelegationVotes } from '/imports/startup/both/modules/Contract';
import { displayModal } from '/imports/ui/modules/modal';
import { Vote } from '/imports/ui/modules/Vote';
import { contractReady, purgeBallot, candidateBallot, getRightToVote, getBallot, setBallot } from '/imports/ui/modules/ballot';
import { clearPopups } from '/imports/ui/modules/popup';
import { Contracts } from '/imports/api/contracts/Contracts';

import '/imports/ui/templates/components/decision/liquid/liquid.html';
import '/imports/ui/templates/components/decision/action/action.js';

const _animateLiquidBar = (fork) => {
  const execution = $(`#execution-${fork.voteId}`);
  if (execution) {
    // display liquid bar
    if (execution.length > 0 && execution.height() === 0) {
      if (fork.tick || Template.instance().election.get().alternative) {
        $(execution).velocity({ height: `${115}px` });
      }
    }

    // hide liquid bar
    if ((execution.length > 0 && execution.height() !== 0) && !Template.instance().election.get().alternative) {
      $(execution).velocity({ height: `${0}px` });
    }
  }
};

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
* @param {boolean} getPercentageValue return value in percentage form
*/
function getBarWidth(value, voteId, editable, interactive, getPercentageValue) {
  if (editable) {
    const wallet = Session.get(voteId);
    if (wallet !== undefined) {
      if (wallet.maxVotes === 0) { return 0; }
      const percentage = parseFloat((value * 100) / wallet.maxVotes, 10).toFixed(2);
      if (interactive) {
        if (getPercentageValue) {
          return `${percentage}%`;
        }
        return `${parseInt(wallet.sliderWidth, 10)}px`;
      }
      if (getPercentageValue) {
        return `${percentage}%`;
      }
      return `${percentageToPixel(percentage, voteId)}px`;
    }
  }
  // profile, only logged user
  const wallet = Meteor.user().profile.wallet;
  return `${percentageToPixel(parseFloat((value * 100) / wallet.maxVotes, 10).toFixed(2), voteId)}px`;
}

/**
* @summary verifies vote settings are in onRendered
* @param {Vote} vote
*/
function voteFailure(vote) {
  return (vote.allocateQuantity <= vote.minVotes && vote.minVotes !== 0 && vote.voteType === 'DELEGATION') ||
    (vote.allocateQuantity < vote.minVotes && vote.voteType === 'VOTE') ||
    (vote.allocateQuantity === vote.inBallot) ||
    (vote.voteType === 'VOTE' && purgeBallot(getBallot(vote.targetId)).length === 0) ||
    (isNaN(vote.allocateQuantity));
}

/**
* @summary decides what to display in liquid bar as counterparty value
* @param {string} voteId vote controller for gui
* @param {boolean} editable if its an editable liquid vote
*/
function agreement(voteId, editable) {
  if (Session.get(voteId).voteType === 'BALANCE') {
    console.log('what?');
    return getBarWidth(Session.get(voteId).placed, voteId, true);
  }
  return getBarWidth(parseFloat(((Session.get(voteId).placed * Session.get(voteId).TOGGLE_DISPLAY_PLACED_BAR) - Session.get(voteId).inBallot) + Session.get(voteId).delegated, 10), voteId, editable);
}

function getPercentage(value, voteId) {
  return parseFloat((value * 100) / Session.get(voteId).balance, 10);
}

/**
* @summary configures dragger for liquid bar handle
*/
const _setupDrag = () => {
  if (Template.instance().data.editable) {
    // drag event
    $(`#voteHandle-${Template.instance().data._id}`).draggable({
      axis: 'x',
      create() {
        const voteId = this.id.replace('voteHandle-', '');
        this.newVote = new Vote(Session.get(voteId), Session.get(voteId).targetId, voteId);
        this.newVote.resetSlider();
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
        if (getBallot(this.newVote.targetId).length === 0 && this.newVote.voteType === 'VOTE') {
          if (this.newVote.inBallot > 0) {
            candidateBallot(Meteor.userId(), this.newVote.targetId);
          }
        }
        Session.set('dragging', voteId);
      },
      drag(event, ui) {
        const voteId = ui.helper.context.id.replace('voteHandle-', '');
        this.newVote.sliderInput(ui.position.left);
        this.calibrateCurrentPos = ui.position.left;
        Session.set(voteId, this.newVote);
        ui.position.left = 0;
      },
      stop(event, ui) {
        // executes the vote
        const voteId = ui.helper.context.id.replace('voteHandle-', '');

        const cancel = () => {
          if (this.newVote.inBallot === 0 && this.newVote.voteType === 'VOTE') {
            setBallot(this.newVote.targetId, undefined);
          }
          Session.set('dragging', false);
          this.newVote.resetSlider();
          Session.set(voteId, this.newVote);
        };

        Meteor.clearTimeout(this.timer);

        if (voteFailure(this.newVote)) {
          cancel();
          if (this.newVote.voteType === 'VOTE' && (this.newVote.allocateQuantity !== this.newVote.inBallot || this.newVote.inBallot === 0)) {
            Session.set('noSelectedOption', this.newVote.voteId);
          }
        } else if (contractReady(this.newVote, Contracts.findOne({ _id: this.newVote.targetId })) || this.newVote.voteType === 'DELEGATION') {
          clearPopups();

          // democracy wins
          this.newVote.execute(cancel);
        }
      },
    });
  }
};

Template.liquid.onCreated(function () {
  let wallet = new Vote(Template.instance().data.wallet, Template.instance().data.targetId, Template.instance().data._id);
  Session.set(Template.instance().data._id, wallet);
  Template.instance().contract = new ReactiveVar(Template.currentData().contract);
  Template.instance().rightToVote = new ReactiveVar(getRightToVote(Template.instance().contract.get()));
  Template.instance().candidateBallot = new ReactiveVar(Template.currentData().candidateBallot);
  Template.instance().ready = new ReactiveVar(false);

  const instance = this;

  instance.autorun(function () {
    wallet = new Vote(instance.data.wallet, instance.data.targetId, instance.data._id);
    if (wallet.voteType === 'DELEGATION') {
      instance.rightToVote.set(getRightToVote(wallet.delegationContract));
      instance.contract.set(wallet.delegationContract);
    }
    Session.set(instance.data._id, wallet);
  });
});


Template.liquid.onRendered(function () {
  if (!Meteor.user()) {
    return;
  }

  if (!Meteor.Device.isPhone()) {
    $(`#voteBar-${this.data._id}`).resize(function () {
      const voteId = this.id.replace('voteBar-', '');
      /*$(`#voteSlider-${voteId}`).width(getBarWidth(Session.get(voteId).inBallot, voteId, true));
      $(`#votePlaced-${voteId}`).width(agreement(voteId, true));*/
      this.newVote = new Vote(Session.get(voteId), Session.get(voteId).targetId, voteId);
      this.newVote.resetSlider();
      Session.set(voteId, this.newVote);
    });
  }
  _setupDrag();
});

Template.liquid.helpers({
  isDelegation() {
    return (Session.get(this._id).voteType === 'DELEGATION');
  },
  rightToVote() {
    return Template.instance().rightToVote.get();
  },
  confirmationRequired() {
    if (Template.instance().contract.get().kind === 'DELEGATION') {
      const signatures = Template.instance().contract.get().signatures;
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
    for (const stamp in Template.instance().contract.get().signatures) {
      if (Template.instance().contract.get().signatures[stamp]._id !== Meteor.user()._id) {
        counterPartyId = Template.instance().contract.get().signatures[stamp]._id;
      }
    }
    displayModal(
      true,
      {
        icon: 'images/modal-delegation.png',
        title: TAPi18n.__('confirm-delegation-votes'),
        message: TAPi18n.__('confirm-delegation-warning').replace('<quantity>', Template.instance().contract.get().wallet.available),
        cancel: TAPi18n.__('not-now'),
        action: TAPi18n.__('confirm-votes'),
        displayProfile: true,
        profileId: counterPartyId,
      },
      function () {
        const settings = {
          condition: {
            transferable: Template.instance().contract.get().transferable,
            portable: Template.instance().contract.get().portable,
            tags: Template.instance().contract.get().tags,
          },
          currency: 'VOTES',
          kind: Template.instance().contract.get().kind,
          contractId: Template.instance().contract.get()._id, // _getContractId(senderId, receiverId, settings.kind),
        };
        sendDelegationVotes(
          Template.instance().contract.get()._id,
          Template.instance().contract.get().signatures[1]._id,
          Template.instance().contract.get().wallet.available,
          settings,
          'CONFIRMED'
        );
      }
    );
  },
  'click #rejection'() {
    let counterPartyId;
    for (const stamp in Template.instance().contract.get().signatures) {
      if (Template.instance().contract.get().signatures[stamp]._id !== Meteor.user()._id) {
        counterPartyId = Template.instance().contract.get().signatures[stamp]._id;
      }
    }
    displayModal(
      true,
      {
        icon: 'images/modal-delegation.png',
        title: TAPi18n.__('reject-delegation-votes'),
        message: TAPi18n.__('reject-delegation-warning').replace('<quantity>', Template.instance().contract.get().wallet.available),
        cancel: TAPi18n.__('not-now'),
        action: TAPi18n.__('reject-votes'),
        displayProfile: true,
        profileId: counterPartyId,
      },
      function () {
        const settings = {
          condition: {
            transferable: Template.instance().contract.get().transferable,
            portable: Template.instance().contract.get().portable,
            tags: Template.instance().contract.get().tags,
          },
          currency: 'VOTES',
          kind: Template.instance().contract.get().kind,
          contractId: Template.instance().contract.get()._id, // _getContractId(senderId, receiverId, settings.kind),
        };
        sendDelegationVotes(
          Template.instance().contract.get()._id,
          Template.instance().contract.get().signatures[0]._id,
          Template.instance().contract.get().wallet.available,
          settings,
          'REJECTED'
        );
      }
    );
  },
});


Template.capital.helpers({
  walletRender() {
    if (Session.get(this._id).voteType === 'BALANCE') {
      return '';
    }
    return 'bar-labels';
  },
  getVotes(value) {
    let label;
    let placed;
    let percentagePlaced;
    let available;
    const inBallot = Session.get(this._id).inBallot;
    if (Session.get(this._id) !== undefined) {
      switch (value) {
        case 'available': {
          if (inBallot === 0) {
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
          } else if (Session.get(this._id).voteType === 'BALANCE') {
            available = Session.get(this._id).available;
            if (available === 0) { available = TAPi18n.__('none'); }
            label = `<strong>${available.toLocaleString()}</strong> ${TAPi18n.__('available')}`;
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
          } else if (isNaN(Math.abs(inBallot + quantity))) {
            // irrational black hole
            label = `<strong> ${Math.abs(inBallot).toLocaleString()}</strong> ${TAPi18n.__('place-in-ballot')}`;
          } else {
            label = `<strong> ${Math.abs(inBallot + quantity).toLocaleString()}</strong> ${TAPi18n.__('place-in-ballot')}`;
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
          if ((placed === 0 || percentagePlaced === 0) && Session.get(this._id).voteType !== 'BALANCE') {
            label = `<strong>${TAPi18n.__('none')}</strong>  ${TAPi18n.__('placed-votes')}`;
          } else if (Session.get(this._id).voteType === 'BALANCE') {
            console.log('heh?');
            console.log(this._id);
            console.log(parseInt(getPercentage(Session.get(this._id).placed, this._id), 10).toLocaleString());
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
        if (Session.get(this._id).voteType === 'BALANCE') {
          return 'stage-vote-totals-available';
        }
        if (inBallot === 0 && (Session.get('dragging') === false || Session.get('dragging') === undefined || Session.get('dragging') !== this._id)) {
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
          return 'stage-placed';
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
  getURL(value) {
    switch (value) {
      case 'placed':
      default:
        if (Meteor.userId()) {
          // console.log(this);
          return `${Router.path('home')}peer/${Meteor.user().username}?votes=sent`;
        }
    }
    return '';
  },
});

Template.bar.helpers({
  available() {
    if (isNaN(Session.get(this._id)._maxWidth)) {
      const vote = Session.get(this._id);
      const initialValue = parseFloat((vote.inBallot * 100) / vote.maxVotes, 10).toFixed(2);
      return `${initialValue}%`;
    }
    return getBarWidth(Session.get(this._id).inBallot, this._id, this.editable, true);
  },
  placed() {
    return agreement(this._id, this.editable);
  },
  min() {
    if (agreement(this._id, this.editable).toNumber() > 0) {
      return 'min-width: 10px;';
    }
    return '';
  },
  positionHandle() {
    const vote = Session.get(this._id);
    const initialValue = parseFloat((vote.inBallot * 100) / vote.maxVotes, 10).toFixed(2);
    return `margin-right: ${parseInt(((initialValue * 23) / 100) - 29, 10)}px `;
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
