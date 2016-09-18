Template.power.rendered = function (user) {
  Session.set('newVote', new Wallet(Meteor.user().profile.wallet));

  $("#voteHandle").draggable({
    axis: "x",
    start: function (event, ui) {
      this.startPosition = Session.get('newVote').allocatePercentage;
      this.placedPercentage = parseInt((Session.get('newVote').placed * 100) / Session.get('newVote').balance);
      this.barWidth = $('#voteBar').width() - (($('#voteBar').width() * this.placedPercentage) / 100);
      this.allocatedWidth = $('#voteSlider').width();
      this.pixelPosition = ((this.startPosition * this.barWidth) / 100);
      this.leftMin = (0 - (this.barWidth / 2) + ($("#voteHandle").width() / 2) + ((this.barWidth / 2) - this.pixelPosition));
      this.leftMax = ((this.barWidth / 2) - ($("#voteHandle").width() / 2) + ((this.barWidth / 2) - this.pixelPosition));
      this.delta = (this.leftMax - this.leftMin);
    },
    drag: function (event, ui) {
      var newVote = Session.get('newVote');
      var percentage = (((ui.position.left * 100) / this.delta) + this.startPosition);
      newVote.allocatePercentage = scope(percentage, 100);
      newVote.allocateQuantity = scope(parseInt((percentage * newVote.balance) / 100), newVote.available);
      newVote.sliderWidth = scope((this.allocatedWidth + ui.position.left), this.barWidth);
      Session.set('newVote', newVote);
      ui.position.left = 0;
    }
  });
}

function scope (value, max) {
  if (value < 0) { return 0 } else if (value > max) { return max } else { return value };
}

Template.power.helpers({
  label: function () {
    var wallet = Session.get('newVote');
    var contract = Session.get('contract');

    switch (wallet.mode) {
      case WALLET_MODE_PENDING:
        switch(contract.kind) {
          case KIND_DELEGATION:
            var voteQuantity = TAPi18n.__('delegate-votes-pending');
            break;
          case KIND_VOTE:
            var voteQuantity = TAPi18n.__('contract-votes-pending');
            break;
        }
        break;
      case WALLET_MODE_EXECUTED:
        switch(contract.kind) {
          case KIND_DELEGATION:
            var voteQuantity = TAPi18n.__('delegate-votes-executed');
            break;
          case KIND_VOTE:
            var voteQuantity = TAPi18n.__('contract-votes-executed');
            break;
        }
        break;
    }

    var quantity = wallet.allocateQuantity;
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
      return wallet.allocatePercentage + '%';
    } else {
      return wallet.sliderWidth + 'px';
    }
  },
  placed: function () {
    var wallet = Session.get('newVote');
    var percentage = parseInt((wallet.placed * 100) / wallet.balance);
    if (percentage <= 0) {
      return 'display:none;';
    } else {
      return percentage + '%';
    }
  },
  alreadyVoted: function () {
    return Modules.client.verifyVote(Session.get('contract').wallet.ledger, Meteor.user()._id);
  }
});
