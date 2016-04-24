if (Meteor.isClient) {

  Template.toggle.rendered = function () {
    behave(this.firstNode, 'slide');
  };

  Template.toggle.helpers({
    setting: function () {
      return this.setting;
    },
    eventHandler: function () {
      return this.eventHandler;
    }
  });

  Template.toggle.events({
    "click #toggle-allowForks": function () {
      Meteor.call("updateContractField", Session.get('contractId'), "allowForks", !getContract().allowForks);
    },
    "click #toggle-multipleChoice": function () {
      Meteor.call("updateContractField", Session.get('contractId'), "multipleChoice", !getContract().multipleChoice);
    },
    "click #toggle-executiveDecision": function () {
      Meteor.call("updateContractField", Session.get('contractId'), "executiveDecision", !getContract().executiveDecision);
    }
  });
  
}
