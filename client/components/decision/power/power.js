Template.power.rendered = function (user) {
  Session.set('newVote', new Wallet(Meteor.user().profile.wallet));

  $("#voteHandle").draggable({
    axis: "x",
    start: function (event, ui) {
      this.startPosition = Session.get('newVote').allocatePercentage;
      this.barWidth = $('#voteBar').width();
      this.allocatedWidth = $('#voteSlider').width();
      this.pixelPosition = ((this.startPosition * this.barWidth) / 100);
      this.leftMin = (0 - (this.barWidth / 2) + ($("#voteHandle").width() / 2) + ((this.barWidth / 2) - this.pixelPosition));
      this.leftMax = ((this.barWidth / 2) - ($("#voteHandle").width() / 2) + ((this.barWidth / 2) - this.pixelPosition));
      this.delta = (this.leftMax - this.leftMin);
    },
    drag: function (event, ui) {
      var newVote = Session.get('newVote');
      var percentage = (((ui.position.left * 100) / this.delta) + this.startPosition);
      newVote.allocatePercentage = ((newVote.available * percentage) / 100);
      if (newVote.allocatePercentage < 0) { newVote.allocatePercentage = 0} else if ( newVote.allocatePercentage > 100 ) { newVote.allocatePercentage = 100; };
      newVote.sliderWidth = this.allocatedWidth + ui.position.left;
      if (newVote.sliderWidth < 0) { newVote.sliderWidth = 0; } else if (newVote.sliderWidth > this.barWidth) { newVote.sliderWidth = this.barWidth; };
      newVote.allocateQuantity = parseInt(newVote.balance * newVote.allocatePercentage / 100);
      Session.set('newVote', newVote);
      ui.position.left = 0;
      console.log('THIS');
    }
  });
}

Template.power.helpers({
  label: function () {
    var voteQuantity = TAPi18n.__(this.label);
    var quantity = Session.get('newVote').allocateQuantity;
    voteQuantity = voteQuantity.replace("<quantity>", quantity);
    voteQuantity = voteQuantity.replace("<type>", function () { if (quantity == 1 ) { return TAPi18n.__('vote-singular') } else { return TAPi18n.__('vote-plural') } } );
    if (quantity == 0) { Session.set('noVotes', true) } else { Session.set('noVotes', false) };
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
    if (wallet.sliderWidth == undefined) {
      //first time setup
      var percentage = parseInt((wallet.allocatePercentage * 100) / wallet.balance);
      return percentage + '%';
    } else {
      return wallet.sliderWidth + 'px';
    }
  },
  placed: function () {
    var wallet = Session.get('newVote');
    var percentage = parseInt((wallet.placed * 100) / wallet.balance);
    return percentage + '%';
  }
});
