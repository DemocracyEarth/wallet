Template.power.rendered = function (user) {
  Session.set('newVote', new Wallet(Meteor.user().profile.wallet));

  $("#voteHandle").draggable({
    axis: "x",
    drag: function (event, ui) {
      var barWidth = $('#voteBar').width();
      var leftMax = parseInt(0 - (barWidth / 2) + ($("#voteHandle").width() / 2));
      var rightMax = parseInt((barWidth / 2) - ($("#voteHandle").width() / 2));

      if (ui.position.left < leftMax) {
        ui.position.left = leftMax;  
      } else if (ui.position.left > rightMax) {
        ui.position.left = rightMax;
      }


    }
  });

}

Template.power.helpers({
  label: function () {
    var voteQuantity = TAPi18n.__(this.label);
    voteQuantity = voteQuantity.replace("<quantity>", Session.get('newVote').allocate);
    voteQuantity = voteQuantity.replace("<type>", function () { if (Session.get('newVote').allocate > 1) { return TAPi18n.__('vote-plural') } else { return TAPi18n.__('vote-singular') } } );
    return voteQuantity;
  }
})

Template.available.helpers({
  votes: function (user) {
    return Session.get('newVote').available;
  }
});

Template.placed.helpers({
  votes: function (user) {
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
