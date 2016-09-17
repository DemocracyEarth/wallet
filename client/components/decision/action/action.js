Template.action.helpers({
  disabled: function () {
    if (disableContractExecution() == true) {
      return 'disabled';
    } else {
      return '';
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
                  icon            : 'images/modal-ballot.png',
                  title           : TAPi18n.__('delegate-votes'),
                  message         : TAPi18n.__('delegate-votes-warning'),
                  cancel          : TAPi18n.__('not-now'),
                  action          : TAPi18n.__('delegate-votes'),
                  isAuthorization : false,
                },
                function() {
                  //Modules.both.publishContract(Session.get('contract')._id);
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
