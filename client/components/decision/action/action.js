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
    "click .contract-save-draft": function (event) {
      //Get all info from current draft
      if (disableContractExecution() == false) {
        var newContract = new contract(
          document.getElementById('contract-title').value,
          document.getElementById('contract-description').value,
          Session.get('contract').tags
        );
        Meteor.call("updateContract", Session.get('contract')._id, newContract);
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
