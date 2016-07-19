Template.action.helpers({
  disabled: function () {
    if (Session.get('disableActionButton') == true) {
      return 'disabled';
    } else {
      return '';
    }
  }
});

Template.action.events({
    "click .contract-save-draft": function (event) {
      //Get all info from current draft
      if (Session.get('disableActionButton') == false) {
        var newContract = new contract(
          document.getElementById('contract-title').value,
          document.getElementById('contract-description').value,
          Session.get('contract').tags
        );
        Meteor.call("updateContract", Session.get('contract')._id, newContract);
      }
    }
});
