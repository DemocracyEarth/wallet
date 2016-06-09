Template.powerBar.helpers({
  availablePercentage: function () {
    if (Meteor.user().profile.votes.total == 0) {
      return '0%';
    } else {

    }
  },
  placedPercentage: function () {
    if (Meteor.user().profile.votes.total == 0) {
      return '0%';
    } else {

    }
  }
})
