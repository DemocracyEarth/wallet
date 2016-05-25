Meteor.publish("contracts", function() {
  return Contracts.find();
});
