import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { isUserSigner, userVotesInContract } from '/imports/startup/both/modules/User';
import { sendDelegationVotes } from '/imports/startup/both/modules/Contract';
import { displayModal } from '/imports/ui/modules/modal';

let voteQuantity;

Template.power.onRendered = function render() {
  if (!Meteor.user()) { return; }

  $("#voteHandle").draggable({
    axis: "x",
    start: function (event, ui) {
      this.newVote = new Wallet(Meteor.user().profile.wallet);
    },
    drag: function (event, ui) {
      this.newVote.sliderInput(ui.position.left);
      Session.set('newVote', this.newVote);
      ui.position.left = 0;
    }
  });
}

Template.power.helpers({
  label: function () {
    var wallet = Session.get('newVote');
    var contract = Session.get('contract');


    if (contract == undefined) {
      return TAPi18n.__('contract-votes-pending');
    };

    if (wallet != undefined) {
      switch (wallet.mode) {
        case 'PENDING':
          switch(contract.kind) {
            case 'DELEGATION':
              voteQuantity = TAPi18n.__('delegate-votes-pending');
              break;
            case 'VOTE':
              voteQuantity = TAPi18n.__('contract-votes-pending');
              break;
          }
          break;
        case 'EXECUTED':
          switch(contract.kind) {
            case 'DELEGATION':
              var voteQuantity = TAPi18n.__('delegate-votes-executed');
              break;
            case 'VOTE':
              var voteQuantity = TAPi18n.__('contract-votes-executed');
              break;
          }
          break;
      }

      //quantity of votes to display
      var rejection = false;
      if (Session.get('rightToVote') == true) {
        var quantity = wallet.allocateQuantity;
      } else {
        //delegation
        if (Session.get('contract').kind == 'DELEGATION') {
          voteQuantity = TAPi18n.__('delegate-votes-executed');
          if (isUserSigner(Session.get('contract').signatures)) {
            var signatures = Session.get('contract').signatures;
            for (i in signatures) {
              if (signatures[i].role == 'DELEGATOR' && signatures[i]._id == Meteor.user()._id) {
                //delegator
                var quantity = userVotesInContract(Meteor.user().profile.wallet, Session.get('contract')._id);
                break;
              } else if (signatures[i].role == 'DELEGATE' && signatures[i]._id == Meteor.user()._id) {
                //delegate
                var quantity = Session.get('contract').wallet.balance;
              }
              if (signatures[i].status == 'REJECTED') {
                rejection = true;
              }
            }
          } else {
            var signatures = Session.get('contract').signatures;
            for (i in signatures) {
              if (signatures[i].status == 'REJECTED') {
                rejection = true;
              }
            }
            if (rejection != true) {
              if (isUserSigner(Session.get('contract').signatures)) {
                var quantity = Session.get('contract').wallet.available;
              } else {
                var quantity = Session.get('contract').wallet.balance;
              }
            }
          }
        }
        //live or finish vote
        if (Session.get('contract').stage != 'DRAFT' && Session.get('contract').kind != 'DELEGATION') {
          var ledger = Session.get('contract').wallet.ledger;
          for (i in ledger) {
            if (ledger[i].ballot != undefined) {
              if (ledger[i].entityId == Meteor.user()._id && ledger[i].ballot.length > 0) {
                voteQuantity = TAPi18n.__('contract-votes-executed');
                quantity = ledger[i].quantity
              }
            }
          }
        }
      }

      //if contract didnt establish
      if (rejection == true) {
        return TAPi18n.__('rejection-no-delegations');
      }

      //if no votes found
      if (quantity == undefined) {
        quantity = TAPi18n.__('no');
      }

      //string narrative
      if (voteQuantity != undefined) {
        voteQuantity = voteQuantity.replace("<quantity>", quantity);
        voteQuantity = voteQuantity.replace("<type>", function () { if (quantity == 1 ) { return TAPi18n.__('vote-singular') } else { return TAPi18n.__('vote-plural') } } );
        if (wallet.allocateQuantity == 0 && Session.get('contract').stage != STAGE_DRAFT) {
          Session.set('noVotes', true)
        } else {
          Session.set('noVotes', false)
        };
        return voteQuantity;
      } else {
        return TAPi18n.__('vote');
      }
    } else {
      return 0;
    }
  },
  rightToVote: function () {
    return Session.get('rightToVote');
  },
  confirmationRequired: function () {
    if (Session.get('contract').kind == 'DELEGATION') {
      var signatures = Session.get('contract').signatures;
      for (i in signatures) {
        if (signatures[i].role == 'DELEGATE' && signatures[i].status == 'PENDING' && signatures[i]._id == Meteor.user()._id) {
          return true;
        }
      }
    }
    return false;
  }
});

Template.power.events({
  'click #confirmation': function (event) {
    for (stamp in Session.get('contract').signatures) {
      if (Session.get('contract').signatures[stamp]._id != Meteor.user()._id) {
        var counterPartyId = Session.get('contract').signatures[stamp]._id;
      }
    };
    displayModal(
      true,
      {
        icon            : 'images/modal-delegation.png',
        title           : TAPi18n.__('confirm-delegation-votes'),
        message         : TAPi18n.__('confirm-delegation-warning').replace('<quantity>', Session.get('contract').wallet.available),
        cancel          : TAPi18n.__('not-now'),
        action          : TAPi18n.__('confirm-votes'),
        displayProfile  : true,
        profileId       : counterPartyId
      },
      function() {
        settings = {
          condition: {
            transferable : Session.get('contract').transferable,
            portable : Session.get('contract').portable,
            tags : Session.get('contract').tags,
          },
          currency: 'VOTES',
          kind: Session.get('contract').kind,
          contractId: Session.get('contract')._id //_getContractId(senderId, receiverId, settings.kind),
        }
        sendDelegationVotes(Session.get('contract')._id, Session.get('contract').signatures[1]._id, Session.get('contract').wallet.available, settings, 'CONFIRMED');
      }
    );
  },
  'click #rejection': function (event) {
    for (stamp in Session.get('contract').signatures) {
      if (Session.get('contract').signatures[stamp]._id != Meteor.user()._id) {
        var counterPartyId = Session.get('contract').signatures[stamp]._id;
      }
    };
    displayModal(
      true,
      {
        icon            : 'images/modal-delegation.png',
        title           : TAPi18n.__('reject-delegation-votes'),
        message         : TAPi18n.__('reject-delegation-warning').replace('<quantity>', Session.get('contract').wallet.available),
        cancel          : TAPi18n.__('not-now'),
        action          : TAPi18n.__('reject-votes'),
        displayProfile  : true,
        profileId       : counterPartyId
      },
      function() {
        settings = {
          condition: {
            transferable : Session.get('contract').transferable,
            portable : Session.get('contract').portable,
            tags : Session.get('contract').tags,
          },
          currency: 'VOTES',
          kind: Session.get('contract').kind,
          contractId: Session.get('contract')._id //_getContractId(senderId, receiverId, settings.kind),
        }
        sendDelegationVotes(Session.get('contract')._id, Session.get('contract').signatures[0]._id, Session.get('contract').wallet.available, settings, 'REJECTED');
      }
    );
  }
})

Template.available.helpers({
  votes: function (user) {
    if (Session.get('newVote') != undefined) {
      return Session.get('newVote').available;
    } else {
      return 0;
    }
  }
});

Template.placed.helpers({
  votes: function (user) {
    if (Session.get('newVote') != undefined) {
      return Session.get('newVote').placed;
    } else {
      return 0;
    }
  }
});

Template.bar.helpers({
  allocate: function () {
    var wallet = Session.get('newVote');
    if (wallet != undefined) {
      if (Session.get('alreadyVoted') == true) {
        return '0px';
      } else {
        return wallet.sliderWidth + 'px';
      }
    } else {
      return '0px';
    }
  },
  placed: function () {
    var wallet = Session.get('newVote');
    if (wallet != undefined) {
      var percentage = parseInt((wallet.placed * 100) / wallet.balance);
      if (wallet.placed == 0) {
        return '0px';
      } else {
        return percentage + '%';
      }
    } else {
      return '0px';
    }
  }
});
