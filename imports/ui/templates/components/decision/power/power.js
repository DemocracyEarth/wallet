import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { transact } from '/imports/api/transactions/transaction';
import { isUserSigner, userVotesInContract } from '/imports/startup/both/modules/User';
import { sendDelegationVotes } from '/imports/startup/both/modules/Contract';
import { displayModal } from '/imports/ui/modules/modal';
import { Wallet } from '/imports/ui/modules/Wallet';
import { contractReady, purgeBallot } from '/imports/ui/modules/ballot';

import './power.html';
import '../action/action.js';

let voteQuantity;

Template.power.onRendered(function render() {
  if (!Meteor.user()) {
    return;
  }
  $(`#voteHandle-${Session.get(`vote-${Session.get('contract')._id}`).voteId}`).draggable({
    axis: 'x',
    start() {
      Session.set('dragging', true);
      this.newVote = new Wallet(Meteor.user().profile.wallet, Session.get('contract')._id);
    },
    drag(event, ui) {
      this.newVote.sliderInput(ui.position.left);
      Session.set(`vote-${Session.get('contract')._id}`, this.newVote);
      ui.position.left = 0;
    },
    stop() {
      // executes the vote
      Session.set('dragging', false);
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
          default:
            if (Session.get('contract').stage === 'LIVE') {
              let finalCaption;
              let vote = () => {};
              const finalBallot = purgeBallot(Session.get('candidateBallot'));
              const votesInBallot = userVotesInContract(Meteor.user().profile.wallet, Session.get('contract')._id);
              const newVotes = parseInt(Session.get(`vote-${Session.get('contract')._id}`).allocateQuantity - votesInBallot, 10);
              const votes = parseInt(votesInBallot + newVotes, 10);
              const settings = {
                condition: {
                  tags: Session.get('contract').tags,
                  ballot: finalBallot,
                },
                currency: 'VOTES',
                kind: Session.get('contract').kind,
                contractId: Session.get('contract')._id,
              };

              // cook vote
              if (votesInBallot === 0) {
                finalCaption = TAPi18n.__('place-votes-warning').replace('<quantity>', Session.get(`vote-${Session.get('contract')._id}`).allocateQuantity);
                vote = () => {
                  transact(
                    Meteor.user()._id,
                    Session.get('contract')._id,
                    Session.get(`vote-${Session.get('contract')._id}`).allocateQuantity,
                    settings
                  );
                };
              } else if (newVotes > 0) {
                finalCaption = TAPi18n.__('place-more-votes-warning').replace('<quantity>', votes.toString()).replace('<add>', newVotes);
                vote = () => {
                  transact(
                    Meteor.user()._id,
                    Session.get('contract')._id,
                    newVotes,
                    settings
                  );
                };
              } else if (newVotes < 0) {
                finalCaption = TAPi18n.__('retrieve-votes-warning').replace('<quantity>', votes.toString()).replace('<retrieve>', Math.abs(newVotes).toString());
                vote = () => {
                  transact(
                    Session.get('contract')._id,
                    Meteor.user()._id,
                    Math.abs(newVotes),
                    settings
                  );
                };
              } else {
                return;
              }

              // ask confirmation
              displayModal(
                true,
                {
                  icon: 'images/modal-vote.png',
                  title: TAPi18n.__('place-vote'),
                  message: finalCaption,
                  cancel: TAPi18n.__('not-now'),
                  action: TAPi18n.__('vote'),
                  displayProfile: false,
                  displayBallot: true,
                  ballot: finalBallot,
                },
                vote
              );
            }
            break;
        }
      } else if (purgeBallot(Session.get('candidateBallot')).length === 0) {
        Session.set('noSelectedOption', true);
      }
    },
  });
});

Template.power.helpers({
  label() {
    const wallet = Session.get(`vote-${Session.get('contract')._id}`);
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
    const inBallot = userVotesInContract(Meteor.user().profile.wallet, Session.get('contract')._id);
    let finalValue;
    if (Session.get(`vote-${Session.get('contract')._id}`) !== undefined) {
      if (value === 'available' && Session.get(`vote-${Session.get('contract')._id}`).allocateQuantity > 0) {
        const available = parseInt(Session.get(`vote-${Session.get('contract')._id}`).available - Session.get(`vote-${Session.get('contract')._id}`).allocateQuantity, 10);
        if (available > 0) {
          return available;
        }
        return TAPi18n.__('none');
      } else if (value === 'inBallot') {
        return inBallot;
      } else if (Session.get(`vote-${Session.get('contract')._id}`)[value] !== 0) {
        if (value === 'allocateQuantity') {
          finalValue = parseInt(Session.get(`vote-${Session.get('contract')._id}`)[value] - inBallot, 10);
        } else {
          finalValue = Session.get(`vote-${Session.get('contract')._id}`)[value];
        }
        return Math.abs(finalValue);
      }
    }
    return TAPi18n.__('none');
  },
  style(value) {
    let quantity = 0;
    const inBallot = userVotesInContract(Meteor.user().profile.wallet, Session.get('contract')._id);
    quantity = Session.get(`vote-${Session.get('contract')._id}`)[value];
    const available = parseInt(Session.get(`vote-${Session.get('contract')._id}`)[value] - Session.get(`vote-${Session.get('contract')._id}`).allocateQuantity, 10);
    switch (value) {
      case 'available':
        if (available === 0) {
          return 'stage-finish-rejected';
        }
        return 'stage-finish-approved';
      case 'inBallot':
        if (Session.get('dragging') === false) {
          if (inBallot === 0) {
            return 'hide';
          }
          return 'stage-inballot';
        }
        return 'hide';
      case 'allocateQuantity':
        if (Session.get('dragging') === true) {
          if (quantity === 0) {
            return 'hide';
          }
          return 'stage-live';
        }
        return 'hide';
      case 'placed':
        return 'stage-placed';
      default:
        return 'stage-finish-alternative';
    }
  },
  negativeAllocation() {
    return (userVotesInContract(Meteor.user().profile.wallet, Session.get('contract')._id) > Session.get(`vote-${Session.get('contract')._id}`).allocateQuantity);
  },
});

/**
* @summary given absolute value returns relative pixel width
* @param {number} value nominal votes to pixel width
* @param {object} bar the item being rendered
* @param {boolean} toPixels return value in pixels, otherwise percentage
*/
function getBarWidth(value, bar, toPixels) {
  if (bar.editable) {
    const wallet = Session.get(`vote-${Session.get('contract')._id}`);
    if (wallet !== undefined) {
      const percentage = parseInt((value * 100) / wallet.balance, 10);
      if (value === 0) {
        return '0px';
      } else if (toPixels) {
        return `${wallet.sliderWidth}px`;
      }
      return `${percentage}%`;
    }
  }
  // profile, only logged user
  const wallet = Meteor.user().profile.wallet;
  return `${parseInt((value * 100) / wallet.balance, 10)}%`;
}

Template.bar.helpers({
  allocate() {
    return getBarWidth(Session.get(`vote-${Session.get('contract')._id}`).available, this, true);
  },
  placed() {
    return getBarWidth(Session.get(`vote-${Session.get('contract')._id}`).placed, this);
  },
  inBallot() {
    return getBarWidth(userVotesInContract(Meteor.user().profile.wallet, Session.get('contract')._id), this);
  },
  hundred() {
    const wallet = Meteor.user().profile.wallet;
    if (wallet.placed === 0) {
      return 'result-unanimous';
    }
    return '';
  },
  voteId() {
    return Session.get(`vote-${Session.get('contract')._id}`).voteId;
  },
});
