Template.power.rendered = function (user) {
  Session.set('newVote', new Wallet(Meteor.user().profile.wallet));
  $("#voteHandle").draggable({
    axis: "x",
    start: function (event, ui) {
      this.newVote = new Wallet(Meteor.user().profile.wallet);
    },
    drag: function (event, ui) {
      this.newVote.sliderInput(ui.position.left);
      Session.set('newVote', this.newVote);
      ui.position.left = 0;
    }
  });
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
    if (Session.get('alreadyVoted') == true) {
      return '0px';
    } else {
      return wallet.sliderWidth + 'px';
    }
  },
  placed: function () {
    var wallet = Session.get('newVote');
    var percentage = parseInt((wallet.placed * 100) / wallet.balance);
    if (wallet.placed == 0) {
      return '0px';
    } else {
      return percentage + '%';
    }
  },
  alreadyVoted: function () {
    var voted = Modules.client.verifyVote(Session.get('contract').wallet.ledger, Meteor.user()._id);
    Session.set('alreadyVoted', voted);
    return voted;
  }
});
