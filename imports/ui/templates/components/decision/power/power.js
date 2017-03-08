import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

import { isUserSigner, userVotesInContract } from '/imports/startup/both/modules/User';
import { sendDelegationVotes } from '/imports/startup/both/modules/Contract';
import { displayModal } from '/imports/ui/modules/modal';
import { Wallet } from '/imports/ui/modules/Wallet';
import { contractReady, purgeBallot, candidateBallot, executeVote } from '/imports/ui/modules/ballot';

import './power.html';
import '../action/action.js';

let voteQuantity;

/**
* @summary converts a percentage value to pixels for current power bar
* @param {number} percentage percentage value to be converted
* @param {string} voteId where to store the vote
* @return {number} pixels
*/
function percentageToPixel(percentage, voteId) {
  // removes 5 pixels for collision buffer
  return parseInt(((percentage * $(`#voteBar-${voteId}`).width()) / 100) - 5, 10);
}

/**
* @summary given absolute value returns relative pixel width
* @param {number} value nominal votes to pixel width
* @param {object} bar the item being rendered
* @param {string} voteId session var containing vote info
* @param {boolean} interactive return value from slider
*/
function getBarWidth(value, bar, interactive) {
  if (bar.editable) {
    const wallet = Session.get(`vote-${bar._id}`);
    if (wallet !== undefined) {
      const percentage = parseFloat((value * 100) / wallet.balance, 10).toFixed(2);
      if (value === 0) {
        return '0px';
      } else if (interactive) {
        // removes 5 pixels for collision buffer
        return `${parseInt(wallet.sliderWidth - 5, 10)}px`;
      }
      return `${percentageToPixel(percentage, bar._id)}px`;
    }
  }
  // profile, only logged user
  const wallet = Meteor.user().profile.wallet;
  return `${percentageToPixel(parseFloat((value * 100) / wallet.balance, 10).toFixed(2), bar._id)}px`;
}

Template.power.onCreated(function () {
  Session.set(`vote-${this.data._id}`, new Wallet(Meteor.user().profile.wallet, Session.get('contract')._id, this.data._id));
});

Template.power.onRendered(function render() {
  if (!Meteor.user()) {
    return;
  }
  $(`#voteHandle-${this.data._id}`).draggable({
    axis: 'x',
    create() {
      const voteId = this.id.replace('voteHandle-', '');
      this.newVote = new Wallet(Meteor.user().profile.wallet, Session.get('contract')._id, voteId);
      Session.set(`vote-${voteId}`, this.newVote);
    },
    start(event, ui) {
      const voteId = ui.helper.context.id.replace('voteHandle-', '');
      this.newVote = new Wallet(Meteor.user().profile.wallet, Session.get('contract')._id, voteId);
      Session.set(`vote-${voteId}`, this.newVote);
      if (Session.get(`vote-${voteId}`) !== undefined) {
        $(`#voteSlider-${voteId}`).velocity('stop');
      }
      if (Session.get('candidateBallot') === undefined) {
        candidateBallot(Meteor.userId());
      }
      Session.set('dragging', true);
    },
    drag(event, ui) {
      const voteId = ui.helper.context.id.replace('voteHandle-', '');
      this.newVote.sliderInput(ui.position.left);
      Session.set(`vote-${voteId}`, this.newVote);
      ui.position.left = 0;
    },
    stop(event, ui) {
      // executes the vote
      const voteId = ui.helper.context.id.replace('voteHandle-', '');
      const cancel = () => {
        if (this.newVote.inBallot === 0) {
          Session.set('candidateBallot', undefined);
        }
        Session.set('dragging', false);
        this.newVote.resetSlider();
        Session.set(`vote-${voteId}`, this.newVote);
      };
      if (contractReady() === true) {
        let counterPartyId;
        switch (Session.get('contract').kind) {
          case 'DELEGATION':
            for (const stamp in Session.get('contract').signatures) {
              if (Session.get('contract').signatures[stamp]._id !== Meteor.user()._id) {
                counterPartyId = Session.get('contract').signatures[stamp]._id;
              }
            }
            displayModal(
              true,
              {
                icon: 'images/modal-delegation.png',
                title: TAPi18n.__('send-delegation-votes'),
                message: TAPi18n.__('delegate-votes-warning').replace('<quantity>', Session.get('newVote').allocateQuantity),
                cancel: TAPi18n.__('not-now'),
                action: TAPi18n.__('delegate-votes'),
                displayProfile: true,
                profileId: counterPartyId,
              },
              () => {
                const settings = {
                  condition: {
                    transferable: Session.get('contract').transferable,
                    portable: Session.get('contract').portable,
                    tags: Session.get('contract').tags,
                  },
                  currency: 'VOTES',
                  kind: Session.get('contract').kind,
                  contractId: Session.get('contract')._id,
                };
                sendDelegationVotes(
                  Session.get('contract').signatures[0]._id,
                  Session.get('contract')._id,
                  Session.get('newVote').allocateQuantity,
                  settings,
                );
              }
            );
            break;
          case 'VOTE':
          default: {
            executeVote(this.newVote, cancel);
            break;
          }
        }
      } else if (purgeBallot(Session.get('candidateBallot')).length === 0) {
        cancel();
        Session.set('noSelectedOption', true);
      }
    },
  });
});

Template.power.helpers({
  label() {
    const wallet = Session.get(`vote-${this.data._id}`);
    const contract = Session.get('contract');
    let rejection = false;
    let signatures;
    let quantity;


    if (contract === undefined) {
      return TAPi18n.__('contract-votes-pending');
    }
    if (wallet !== undefined) {
      switch (wallet.mode) {
        case 'PENDING':
          switch (contract.kind) {
            case 'DELEGATION':
              voteQuantity = TAPi18n.__('delegate-votes-pending');
              break;
            default: // 'VOTE'
              voteQuantity = TAPi18n.__('contract-votes-pending');
              break;
          }
          break;
        case 'EXECUTED':
        default:
          switch (contract.kind) {
            case 'DELEGATION':
              voteQuantity = TAPi18n.__('delegate-votes-executed');
              break;
            default: // 'VOTE'
              voteQuantity = TAPi18n.__('contract-votes-executed');
              break;
          }
          break;
      }

      // quantity of votes to display
      if (Session.get('rightToVote') === true) {
        quantity = wallet.allocateQuantity;
      } else {
        // delegation
        if (Session.get('contract').kind === 'DELEGATION') {
          voteQuantity = TAPi18n.__('delegate-votes-executed');
          if (isUserSigner(Session.get('contract').signatures)) {
            signatures = Session.get('contract').signatures;
            for (const i in signatures) {
              if (signatures[i].role === 'DELEGATOR' && signatures[i]._id === Meteor.user()._id) {
                // delegator
                quantity = userVotesInContract(Meteor.user().profile.wallet, Session.get('contract')._id);
                break;
              } else if (signatures[i].role === 'DELEGATE' && signatures[i]._id === Meteor.user()._id) {
                // delegate
                quantity = Session.get('contract').wallet.balance;
              }
              if (signatures[i].status === 'REJECTED') {
                rejection = true;
              }
            }
          } else {
            signatures = Session.get('contract').signatures;
            for (const i in signatures) {
              if (signatures[i].status === 'REJECTED') {
                rejection = true;
              }
            }
            if (rejection !== true) {
              if (isUserSigner(Session.get('contract').signatures)) {
                quantity = Session.get('contract').wallet.available;
              } else {
                quantity = Session.get('contract').wallet.balance;
              }
            }
          }
        }
        // live or finish vote
        if (Session.get('contract').stage !== 'DRAFT' && Session.get('contract').kind !== 'DELEGATION') {
          const ledger = Session.get('contract').wallet.ledger;
          for (const i in ledger) {
            if (ledger[i].ballot !== undefined) {
              if (ledger[i].entityId === Meteor.user()._id && ledger[i].ballot.length > 0) {
                voteQuantity = TAPi18n.__('contract-votes-executed');
                quantity = ledger[i].quantity;
              }
            }
          }
        }
      }

      // if contract didnt establish
      if (rejection === true) {
        return TAPi18n.__('rejection-no-delegations');
      }

      // if no votes found
      if (quantity === undefined) {
        quantity = TAPi18n.__('no');
      }

      // string narrative
      if (voteQuantity !== undefined) {
        voteQuantity = voteQuantity.replace('<quantity>', quantity);
        voteQuantity = voteQuantity.replace('<type>', function () {
          if (quantity === 1) {
            return TAPi18n.__('vote-singular');
          }
          return TAPi18n.__('vote-plural');
        });
        if (wallet.allocateQuantity === 0 && Session.get('contract').stage !== 'DRAFT') {
          Session.set('noVotes', true);
        } else {
          Session.set('noVotes', false);
        }
        return voteQuantity;
      }
      return TAPi18n.__('vote');
    }
    return 0;
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
  }
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
    const inBallot = Session.get(`vote-${this._id}`).inBallot;
    let label;
    if (Session.get(`vote-${this._id}`) !== undefined) {
      switch (value) {
        case 'available': {
          const available = parseInt((Session.get(`vote-${this._id}`).available + Session.get(`vote-${this._id}`).inBallot) - Session.get(`vote-${this._id}`).allocateQuantity, 10);
          if (Session.get(`vote-${this._id}`).allocateQuantity > 0 && (available <= 0)) {
            label = `<strong>${TAPi18n.__('none')}</strong> ${TAPi18n.__('available-votes')}`;
          } else {
            label = `<strong>${available}</strong> ${TAPi18n.__('available-votes')}`;
          }
          break;
        }
        case 'inBallot':
          if (inBallot === 0) {
            label = `<strong>${TAPi18n.__('none')}</strong> ${TAPi18n.__('on-this-ballot')}`;
          } else {
            label = `<strong>${inBallot}</strong> ${TAPi18n.__('on-this-ballot')}`;
          }
          break;
        case 'allocateQuantity': {
          const quantity = parseInt(Session.get(`vote-${this._id}`)[value] - inBallot, 10);
          if (Math.abs(quantity) === inBallot && (quantity < 0)) {
            label = TAPi18n.__('remove-all-votes');
          } else {
            label = `<strong>${Math.abs(inBallot + quantity)}</strong> ${TAPi18n.__('place-in-ballot')}`;
          }
          break;
        }
        case 'placed':
        default:
          if (Meteor.user().profile.wallet.placed === 0) {
            label = `<strong>${TAPi18n.__('none')}</strong>  ${TAPi18n.__('placed-votes')}`;
          } else {
            label = `<strong>${parseInt(Meteor.user().profile.wallet.placed - inBallot, 10)}</strong>  ${TAPi18n.__('placed-votes')}`;
          }
          break;
      }
    }
    return label;
  },
  style(value) {
    const inBallot = Session.get(`vote-${this._id}`).inBallot;
    switch (value) {
      case 'available': {
        const available = parseInt((Session.get(`vote-${this._id}`).available + Session.get(`vote-${this._id}`).inBallot) - Session.get(`vote-${this._id}`).allocateQuantity, 10);
        if (Session.get(`vote-${this._id}`).allocateQuantity > 0 && (available <= 0)) {
          return 'stage-finish-rejected';
        }
        return 'stage-finish-approved';
      }
      case 'inBallot':
        if (Session.get('dragging') === false || Session.get('dragging') === undefined) {
          if (inBallot === 0) {
            return 'hide';
          }
          return 'stage-inballot';
        }
        return 'hide';
      case 'allocateQuantity': {
        const quantity = parseInt(Session.get(`vote-${this._id}`)[value] - inBallot, 10);
        if (Session.get('dragging') === true) {
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
    return (Session.get(`vote-${this._id}`).inBallot > Session.get(`vote-${this._id}`).allocateQuantity);
  },
});

Template.bar.helpers({
  inBallot() {
    return getBarWidth(Session.get(`vote-${this._id}`).inBallot, this, true);
  },
  placed() {
    return getBarWidth(parseFloat(Session.get(`vote-${this._id}`).placed - Session.get(`vote-${this._id}`).inBallot, 10), this);
  },
  hundred() {
    const wallet = Meteor.user().profile.wallet;
    if (wallet.placed === 0) {
      return 'result-unanimous';
    }
    return '';
  },
});
