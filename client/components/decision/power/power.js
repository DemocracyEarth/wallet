Template.power.rendered = function (user) {
  Session.set('placedVotes', 0);
  Session.set('availableVotes', 0);
}

Template.available.helpers({
  votes: function (user) {
    getUserVotes(user, 'availableVotes');
    return Session.get('availableVotes');
  }
})

Template.placed.helpers({
  votes: function (user) {
    getUserVotes(user, 'placedVotes');
    return Session.get('placedVotes');
  }
})

function getUserVotes (userId, sessionVar) {
  if (userId != Meteor.userId()) {
    Meteor.call('getUserInfo', userId, function (error, data) {
      if (error)
        console.log(error);

        if (data.profile != undefined) {
          Session.set(sessionVar, data.profile.wallet.balance)
        }
    });
  } else {
    if (Meteor.user().profile.wallet != undefined) {
      Session.set(sessionVar, Meteor.user().profile.wallet.balance);
    } else {
      return 0;
    }
  }
}
