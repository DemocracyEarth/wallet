Template.action.events({
    "click .contract-save-draft": function (event) {
      //Get all info from current draft
      var newContract = new contract(
        document.getElementById('contract-title').value,
        document.getElementById('contract-description').value,
        getContract().tags
      );
      Meteor.call("updateContract", getContract()._id, newContract);
    }
});
