Template.power.rendered = function (user) {
  if (!Meteor.user()) { return };

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

    if (contract == undefined) {
      return TAPi18n.__('contract-votes-pending');
    };

    if (wallet != undefined) {
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
      if (voteQuantity != undefined) {
        voteQuantity = voteQuantity.replace("<quantity>", quantity);
        voteQuantity = voteQuantity.replace("<type>", function () { if (quantity == 1 ) { return TAPi18n.__('vote-singular') } else { return TAPi18n.__('vote-plural') } } );
        if (wallet.allocateQuantity == 0) {
          Session.set('noVotes', true)
        } else {
          Session.set('noVotes', false)
        };
        return voteQuantity;
      } else {
        return TAPi18n.__('vote');
      }
    } else {
      return 0;
    }
  }
})

Template.available.helpers({
  votes: function (user) {
    if (Session.get('newVote') != undefined) {
      return Session.get('newVote').available;
    } else {
      return 0;
    }
  }
});

Template.placed.helpers({
  votes: function (user) {
    if (Session.get('newVote') != undefined) {
      return Session.get('newVote').placed;
    } else {
      return 0;
    }
  }
});

Template.bar.helpers({
  allocate: function () {
    var wallet = Session.get('newVote');
    if (wallet != undefined) {
      if (Session.get('alreadyVoted') == true) {
        return '0px';
      } else {
        return wallet.sliderWidth + 'px';
      }
    } else {
      return '0px';
    }
  },
  placed: function () {
    var wallet = Session.get('newVote');
    if (wallet != undefined) {
      var percentage = parseInt((wallet.placed * 100) / wallet.balance);
      if (wallet.placed == 0) {
        return '0px';
      } else {
        return percentage + '%';
      }
    } else {
      return '0px';
    }
  },
  alreadyVoted: function () {
    if (Session.get('contract')) {
      if (Session.get('contract').wallet != undefined) {
        var voted = Modules.client.verifyVote(Session.get('contract').wallet.ledger, Meteor.user()._id);
        Session.set('alreadyVoted', voted);
        return voted;
      } else {
        return false;
      }
    }
  },
  rightToVote: function () {
    return Session.get('rightToVote');
  }
});
