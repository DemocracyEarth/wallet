Template.profile.helpers({
  configProfile: function () {
    return !Meteor.user().profile.configured;
  },
  tags: function () {
    if (Meteor.user().profile.votes.total > 0) {

    } else {

    }
  },
  userId: function () {
    return Meteor.user()._id;
  },
  notVerified: function () {

  },
  hasDelegations: function () {
    //TODO implement delegation reader to display them.
    return false;
  }
})
