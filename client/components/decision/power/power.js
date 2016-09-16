Template.power.rendered = function (user) {
  /*Session.set('placedVotes', 0);
  Session.set('availableVotes', 0);
  Session.set('barEnabled', true);*/
  Session.set('newVote', new Wallet(Meteor.user().profile.wallet));
}

Template.available.helpers({
  votes: function (user) {
    //Modules.client.getWalletVotes(user, 'availableVotes');
    return Session.get('newVote').available;
  }
});

Template.placed.helpers({
  votes: function (user) {
    //Modules.client.getWalletVotes(user, 'placedVotes');
    return Session.get('newVote').placed;
  }
});

Template.bar.helpers({
  available: function () {
    var wallet = Session.get('newVote');
    var percentage = parseInt((wallet.available * 100) / wallet.balance);
    if (wallet.initialized) {
      percentage /= 2;
      wallet.initialized = false;
    };
    return percentage + '%';
  },
  placed: function () {
    var wallet = Session.get('newVote');
    var percentage = parseInt((wallet.placed * 100) / wallet.balance);
    return percentage + '%';
  }
});
