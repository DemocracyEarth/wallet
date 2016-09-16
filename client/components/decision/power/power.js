Template.power.rendered = function (user) {
  Session.set('newVote', new Wallet(Meteor.user().profile.wallet));

  $("#voteHandle").draggable({
    axis: "x",
    drag: function (event, ui) {
      var barWidth = $('#voteBar').width();
      var leftMax = parseInt(0 - (barWidth / 2) + ($("#voteHandle").width() / 2));
      var rightMax = parseInt((barWidth / 2) - ($("#voteHandle").width() / 2));
      var delta = parseInt(rightMax - leftMax);
      var newVote = Session.get('newVote');
      var percentage = parseInt(((ui.position.left * 100) / delta) + 50);
      if (ui.position.left < leftMax) {
        ui.position.left = leftMax;
      } else if (ui.position.left > rightMax) {
        ui.position.left = rightMax;
      }
      newVote.allocate = parseInt((newVote.available * percentage) / 100);
      Session.set('newVote', newVote);
      ui.position.left = 0;
    }
  });

}

Template.power.helpers({
  label: function () {
    var voteQuantity = TAPi18n.__(this.label);
    voteQuantity = voteQuantity.replace("<quantity>", Session.get('newVote').allocate);
    voteQuantity = voteQuantity.replace("<type>", function () { if (Session.get('newVote').allocate == 1 ) { return TAPi18n.__('vote-singular') } else { return TAPi18n.__('vote-plural') } } );
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
  allocate: function () {
    var wallet = Session.get('newVote');
    var percentage = parseInt((wallet.allocate * 100) / wallet.balance);
    return percentage + '%';
  },
  placed: function () {
    var wallet = Session.get('newVote');
    var percentage = parseInt((wallet.placed * 100) / wallet.balance);
    return percentage + '%';
  }
  /*allocate: function () {
    var wallet = Session.get('newVote');
    var percentage = parseInt((wallet.allocate * 100) / wallet.balance);
    console.log(percentage);
    return percentage + '%';
  }*/
});

function getPercentage (walletVar) {

}
