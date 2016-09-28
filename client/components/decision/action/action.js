Template.action.helpers({
  disabled: function () {
    if (disableContractExecution()) {
      return 'disabled';
    } else {
      if (Session.get('newVote') != undefined) {
        switch (Session.get('newVote').mode) {
          case WALLET_MODE_EXECUTED:
            return 'executed';
          default:
            return '';
        }
      } else {
        return '';
      }
    }
  }
});

Template.action.events({
    "click .action-button": function (event) {
      //get all info from current draft
      if (this.enabled) {
        if (disableContractExecution() == false) {
          switch(Session.get('contract').kind) {
            case KIND_DELEGATION:
              for (stamp in Session.get('contract').signatures) {
                if (Session.get('contract').signatures[stamp]._id != Meteor.user()._id) {
                  var counterPartyId = Session.get('contract').signatures[stamp]._id;
                }
              };
              Modules.client.displayModal(
                true,
                {
                  icon            : 'images/modal-delegation.png',
                  title           : TAPi18n.__('send-delegation-votes'),
                  message         : TAPi18n.__('delegate-votes-warning').replace('<quantity>', Session.get('newVote').allocateQuantity),
                  cancel          : TAPi18n.__('not-now'),
                  action          : TAPi18n.__('delegate-votes'),
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
                    currency: CURRENCY_VOTES,
                    kind: Session.get('contract').kind,
                    contractId: Session.get('contract')._id
                  }
                  Modules.both.sendDelegationVotes(Session.get('contract').signatures[0]._id, Session.get('contract')._id, Session.get('newVote').allocateQuantity, settings);
                }
              );
              break;
            case KIND_VOTE:
              if (Session.get('contract').stage == STAGE_DRAFT) {
                Modules.client.displayModal(
                  true,
                  {
                    icon            : 'images/modal-ballot.png',
                    title           : TAPi18n.__('launch-vote-proposal'),
                    message         : TAPi18n.__('publish-proposal-warning'),
                    cancel          : TAPi18n.__('not-now'),
                    action          : TAPi18n.__('publish-proposal'),
                    displayProfile  : false
                  },
                  function() {
                    Modules.both.publishContract(Session.get('contract')._id);
                  }
                );
              } else if (Session.get('contract').stage == STAGE_LIVE) {
                Modules.client.displayModal(
                  true,
                  {
                    icon            : 'images/modal-ballot.png',
                    title           : TAPi18n.__('place-vote'),
                    message         : TAPi18n.__('place-votes-warning').replace('<quantity>', Session.get('newVote').allocateQuantity),
                    cancel          : TAPi18n.__('not-now'),
                    action          : TAPi18n.__('vote'),
                    displayProfile  : false
                  },
                  function() {
                    var ballot = Modules.client.purgeBallot(Session.get('candidateBallot'));
                    settings = {
                      condition: {
                        tags : Session.get('contract').tags,
                        ballot : ballot
                      },
                      currency: CURRENCY_VOTES,
                      kind: Session.get('contract').kind,
                      contractId: Session.get('contract')._id
                    }
                    console.log(ballot);
                    Modules.both.vote(Meteor.user()._id, Session.get('contract')._id, Session.get('newVote').allocateQuantity, settings);
                  }
                );
              }
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
  } else if (Session.get('missingTitle')) {
    return true;
  } else if (Session.get('mistypedTitle')) {
    return true;
  } else if (Session.get('duplicateURL')) {
    return true;
  } else if (Session.get('noVotes')) {
    return true;
  } else if (!Session.get('rightToVote')) {
    return true;
  } else {
    if (Session.get('contract').kind == KIND_VOTE && Session.get('contract').stage == STAGE_LIVE) {
      if (!Modules.client.ballotReady()) {
        return true;
      }
    }
    if (Session.get('newVote') != undefined) {
      if (Session.get('newVote').mode == WALLET_MODE_PENDING || Session.get('newVote').mode == undefined) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
}
