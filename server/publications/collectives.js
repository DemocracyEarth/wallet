Meteor.publish("collectives", function () {
    return Collectives.find();
});
