Template.power.rendered = function (user) {
  Session.set('newVote', new Wallet(Meteor.user().profile.wallet));

  $("#voteHandle").draggable({
    axis: "x",
    start: function (event, ui) {
      this.startPosition = Session.get('newVote').allocatePercentage;
      this.barWidth = $('#voteBar').width();
      this.allocatedWidth = $('#barAllocate').width();
      this.pixelPosition = ((this.startPosition * this.barWidth) / 100);
      this.leftMax = (0 - (this.barWidth / 2) + ($("#voteHandle").width() / 2) + ((this.barWidth / 2) - this.pixelPosition));
      this.rightMax = ((this.barWidth / 2) - ($("#voteHandle").width() / 2) + ((this.barWidth / 2) - this.pixelPosition));
      this.delta = (this.rightMax - this.leftMax);
      /*
      console.log('startPosition = ' + this.startPosition);
      console.log('barWidth = ' + this.barWidth);
      console.log('pixelPosition = ' + this.pixelPosition);
      console.log('leftMax = ' + this.leftMax);
      console.log('rightMax = ' + this.rightMax);
      console.log('delta = ' + this.delta);
      */
    },
    drag: function (event, ui) {
      var newVote = Session.get('newVote');
      var percentage = (((ui.position.left * 100) / this.delta) + this.startPosition);
      newVote.allocatePercentage = ((newVote.available * percentage) / 100);
      newVote.allocatedBarWidth = this.allocatedWidth + ui.position.left;
      if (newVote.allocatedBarWidth < 0) {
        newVote.allocatedBarWidth = 0;
      } else if (newVote.allocatedBarWidth > this.barWidth) {
        newVote.allocatedBarWidth = this.barWidth;
      }
      Session.set('newVote', newVote);
      ui.position.left = 0;
    }
  });

}

Template.power.helpers({
  label: function () {
    var voteQuantity = TAPi18n.__(this.label);
    voteQuantity = voteQuantity.replace("<quantity>", Session.get('newVote').allocatePercentage);
    voteQuantity = voteQuantity.replace("<type>", function () { if (Session.get('newVote').allocatePercentage == 1 ) { return TAPi18n.__('vote-singular') } else { return TAPi18n.__('vote-plural') } } );
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
    if (wallet.allocatedBarWidth == undefined) {
      //first time setup
      var percentage = parseInt((wallet.allocatePercentage * 100) / wallet.balance);
      return percentage + '%';
    } else {
      return wallet.allocatedBarWidth + 'px';
    }
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
