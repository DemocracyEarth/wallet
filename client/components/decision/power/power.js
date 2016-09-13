Template.power.rendered = function (user) {
  Session.set('placedVotes', 0);
  Session.set('availableVotes', 0);
}

Template.available.helpers({
  votes: function (user) {
    Modules.client.getWalletVotes(user, 'availableVotes');
    return Session.get('availableVotes');
  }
});

Template.placed.helpers({
  votes: function (user) {
    Modules.client.getWalletVotes(user, 'placedVotes');
    return Session.get('placedVotes');
  }
});

Template.bar.helpers({
  available: function () {
    if (Meteor.user().profile.wallet.available == 0) {
      return '0%';
    } else {

    }
  },
  placed: function () {
    if (Meteor.user().profile.wallet.placed == 0) {
      return '0%';
    } else {

    }
  }
});
