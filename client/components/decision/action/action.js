Template.action.helpers({
  disabled: function () {
    if (disableContractExecution() == true) {
      return 'disabled';
    } else {
      switch (Session.get('newVote').mode) {
        case WALLET_MODE_EXECUTED:
          return 'executed';
          break;
        default:
          return '';
      }
    }
  }
});

Template.action.events({
    "click .action-button": function (event) {
      //Get all info from current draft
      if (this.enabled) {
        if (disableContractExecution() == false) {
          switch(Session.get('contract').kind) {
            case KIND_DELEGATION:
              Modules.client.displayModal(
                true,
                {
                  icon            : 'images/modal-delegation.png',
                  title           : TAPi18n.__('send-delegation-votes'),
                  message         : TAPi18n.__('delegate-votes-warning').replace('<quantity>', Session.get('newVote').allocateQuantity),
                  cancel          : TAPi18n.__('not-now'),
                  action          : TAPi18n.__('delegate-votes'),
                  isAuthorization : false,
                },
                function() {
                  settings = {
                    condition: {
                      transferable : Session.get('contract').transferable,
                      portable : Session.get('contract').portable,
                      tags : Session.get('contract').tags,
                    },
                    currency: CURRENCY_VOTES,
                    kind: Session.get('contract').kind,
                    contractId: Session.get('contract')._id //_getContractId(senderId, receiverId, settings.kind),
                  }
                  Modules.both.sendDelegationVotes(Session.get('contract').signatures[0]._id, Session.get('contract')._id, Session.get('newVote').allocateQuantity, settings);
                }
              );
              break;
            case KIND_VOTE:
              Modules.client.displayModal(
                true,
                {
                  icon            : 'images/modal-ballot.png',
                  title           : TAPi18n.__('launch-vote-proposal'),
                  message         : TAPi18n.__('publish-proposal-warning'),
                  cancel          : TAPi18n.__('not-now'),
                  action          : TAPi18n.__('publish-proposal'),
                  isAuthorization : false,
                },
                function() {
                  Modules.both.publishContract(Session.get('contract')._id);
                }
              );
              break;
          }
        }
      }
    }
});

function disableContractExecution() {
  if (Session.get('emptyBallot')) {
    return true;
  } else if (Session.get('unauthorizedFork')) {
    return true;
  } else if (Session.get('noTags')) {
    return true;
  } else if (Session.get('missingTitle')) {
    return true;
  } else if (Session.get('mistypedTitle')) {
    return true;
  } else if (Session.get('duplicateURL')) {
    return true;
  } else if (Session.get('noVotes')) {
    return true;
  } else {
    return false;
  }
}
