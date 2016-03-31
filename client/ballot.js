if (Meteor.isClient) {
  var rank = 0;

  Template.ballot.rendered = function () {
      rank = 0;

      //Dragable options
      this.$('#ballotOption, #proposalSuggestions').sortable({
        stop: function(e, ui) {
          var rankOrder = new Array();
          $('#ballotOption li').each(function( index ) {
            rankOrder.push($( this ).attr('value'));
          });
          Meteor.call('updateBallotRank', Session.get('contractId'), rankOrder);
          Session.set('removeProposal', false);
        },
        start: function (event, ui) {
          ui.helper.height(ui.helper.height() - 10);
          ui.helper.width(ui.helper.width());
          ui.placeholder.width(ui.helper.width());
          ui.placeholder.height(ui.helper.height());

          if (this.id == "ballotOption") {
            Session.set('removeProposal', true);
          }
        },
        receive: function (event, ui) {
          sortableIn = true;
        },
        over: function(e, ui) {
          sortableIn = true;
        },
        out: function(e, ui) {
          sortableIn = false;
        },
        beforeStop: function(e, ui) {
          if (sortableIn == false) {
            if (Session.get('removeProposal')) {
              //removeTag(ui.item.get(0).getAttribute('value'));
              Meteor.call("removeFork", Session.get('contractId'), ui.item.get(0).getAttribute('value'));
              ui.item.get(0).remove();
              Session.set('removeProposal', false);
            }
          }
        },
        //refreshPositions: true,
        revert: 100,
        cancel: '.nondraggable',
        tolerance: 'pointer',
        items: "> li",
        forceHelperSize: true,
        helper: 'clone',
        zIndex: 9999,
        placeholder: 'vote vote-placeholder'

    }).disableSelection();

  };

  Template.ballot.helpers({
    allowForks: function () {
      if (getContract().allowForks == true) {
        return 'toggle-activated';
      }
    },
    multipleChoice: function () {
      if (getContract().multipleChoice == true) {
        return 'toggle-activated';
      }
    },
    options: function () {
      var contractBallot = Contracts.findOne( { _id: Session.get('contractId') }, {reactive: false}).ballot;
      var ballot = new Array();

      var keys = [],
          k, i, len;

      //Sort by Rank on DB
      for (var i = 0; i < contractBallot.length; i++) {
        if (contractBallot[i].rank) {
          keys.push(parseInt(contractBallot[i].rank));
        }
      };
      keys.sort(function sortNumber(a,b) {
        return a - b;
      });
      for (i = 0; i < keys.length; i++) {
        for (k = 0; k < contractBallot.length; k++) {
          if (contractBallot[k].rank == keys[i]) {
            ballot[i] = contractBallot[k];
          }
        }
      }
      return ballot;
    },
    disabledCheckboxes: function () {
      return displayTimedWarning ('disabledCheckboxes');
    },
    backdating: function () {
      return displayTimedWarning ('backdating');
    },
    duplicateFork: function() {
      return displayTimedWarning ('duplicateFork');
    },
    datePicker: function () {
      $('#date-picker').datepicker();
    },
    unauthorizedFork: function () {
      return Session.get('unauthorizedFork');
    }
  });

  Template.fork.helpers({
    checkbox: function (mode) {
      switch (mode) {
        case 'AUTHORIZE':
          return 'vote-authorize nondraggable';
        case 'REJECT':
          return 'vote-authorize unauthorized nondraggable';
        case 'FORK':
          return 'vote vote-alternative';
      }
    },
    action: function () {
        if (this.authorized == false) {
          return 'undefined';
        }
    },
    option: function (mode) {
      if (Session.get('stage') == 'draft') {
        return 'disabled'
      } else {
        switch (mode) {
          case 'AUTHORIZE':
            return '';
          case 'REJECT':
            return 'option-link ';
          default:
            return '';
        }
      }
    },
    decision: function (mode) {
      switch (mode) {
        case 'REJECT':
          return 'option-link unauthorized';
        default:
          return '';
      }
    },
    caption: function (mode) {
      if (mode != 'FORK') {
        return TAPi18n.__(mode);
      } else {
        return this.label;
      }
    },
    tick: function (draftView) {
      if (draftView) { return 'disabled' };
    }
  });

  Template.ballot.events({
    "click #toggle-allowForks": function () {
      Meteor.call("updateContractField", getContract()._id, "allowForks", !getContract().allowForks);
    },
    "click #toggle-multipleChoice": function () {
      Meteor.call("updateContractField", getContract()._id, "multipleChoice", !getContract().multipleChoice);
    },
    "submit #fork-form, click #add-fork-proposal": function (event) {
      event.preventDefault();
      Meteor.call('addCustomForkToContract', getContract()._id, document.getElementById('text-fork-proposal').value, function(error) {
        if (error && error.error == 'duplicate-fork') {
          Session.set('duplicateFork', true)
        }
      });
      Meteor.setTimeout(function () {document.getElementById('text-fork-proposal').value = '';},100);
    }
  });

  Template.fork.events({
    "click #ballotCheckbox": function () {
      switch (Session.get('stage')) {
        case 'draft':
          Session.set('disabledCheckboxes', true);
          break;
      }
    },

    "click #remove-fork": function () {
      Meteor.call("removeFork", getContract()._id, this._id);
    }
  });

}
