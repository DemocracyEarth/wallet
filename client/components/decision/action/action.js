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
      if (disableContractExecution() == false) {
        console.log('hola?');
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
            Modules.both.publishContract(Session.get('contractId'));
          }
        );
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
  } else {
    return false;
  }
}
