Meteor.publish("tags", function () {
    return Tags.find();
});
