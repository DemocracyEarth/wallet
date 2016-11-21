import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { isUserSigner, userVotesInContract } from '/imports/startup/both/modules/User';
import { sendDelegationVotes } from '/imports/startup/both/modules/Contract';
import { displayModal } from '/imports/ui/modules/modal';
import { Wallet } from '/imports/ui/modules/Wallet';

import './power.html';
import '../action/action.js';

let voteQuantity;

Template.power.onRendered(function render() {
  if (!Meteor.user()) {
    return;
  }
  $('#voteHandle').draggable({
    axis: 'x',
    start(event, ui) {
      this.newVote = new Wallet(Meteor.user().profile.wallet);
    },
    drag(event, ui) {
      this.newVote.sliderInput(ui.position.left);
      Session.set('newVote', this.newVote);
      ui.position.left = 0;
    },
  });
});

Template.power.helpers({
  label() {
    const wallet = Session.get('newVote');
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
        sendDelegationVotes(Session.get('contract')._id, Session.get('contract').signatures[1]._id, Session.get('contract').wallet.available, settings, 'CONFIRMED');
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
        sendDelegationVotes(Session.get('contract')._id, Session.get('contract').signatures[0]._id, Session.get('contract').wallet.available, settings, 'REJECTED');
      }
    );
  },
});

Template.available.helpers({
  votes() {
    if (this.editable) {
      if (Session.get('newVote') !== undefined) {
        return Session.get('newVote').available;
      }
      return 0;
    }
    return Meteor.user().profile.wallet.available;
  },
});

Template.placed.helpers({
  votes() {
    if (Session.get('newVote') !== undefined) {
      return Session.get('newVote').placed;
    }
    return 0;
  },
});

Template.bar.helpers({
  allocate() {
    if (this.editable) {
      const wallet = Session.get('newVote');
      if (wallet !== undefined) {
        if (Session.get('alreadyVoted') === true) {
          return '0px';
        }
        return `${wallet.sliderWidth}px`;
      }
      return '0px';
    }
    // profile, only logged user
    const wallet = Meteor.user().profile.wallet;
    return `${parseInt((wallet.available * 100) / wallet.balance, 10)}%`;
  },
  placed() {
    if (this.editable) {
      const wallet = Session.get('newVote');
      if (wallet !== undefined) {
        const percentage = parseInt((wallet.placed * 100) / wallet.balance, 10);
        if (wallet.placed === 0) {
          return '0px';
        }
        return `${percentage}%`;
      }
    }
    // profile, only logged user
    const wallet = Meteor.user().profile.wallet;
    return `${parseInt((wallet.placed * 100) / wallet.balance, 10)}%`;
  },
  hundred() {
    const wallet = Meteor.user().profile.wallet;
    if (wallet.placed === 0) {
      return 'result-unanimous';
    }
    return '';
  },
});
