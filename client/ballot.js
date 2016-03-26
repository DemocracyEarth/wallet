if (Meteor.isClient) {
  var rank = 0;

  Template.ballot.rendered = function () {
      rank = 0;

      //Dragable options
      this.$('#ballotOption').sortable({
        stop: function(e, ui) {
          var newRank = new Number();
          el = parseFloat(ui.item.get(0).getAttribute('rank'));
          if (ui.item.prev().get(0) != undefined) {
            before = parseFloat(ui.item.prev().get(0).getAttribute('rank'));
          } else {
            before = undefined;
          }
          if (ui.item.next().get(0) != undefined) {
            after = parseFloat(ui.item.next().get(0).getAttribute('rank'));
          } else {
            after = undefined;
          }
          if(!before) {
            console.log('no before');
            newRank = after - 1
          } else if(!after) {
            console.log('no after');
            newRank = before + 1
          } else {
            newRank = (after + before)/2
          }
          Meteor.call('updateBallotRank', Session.get('contractId'), ui.item.get(0).getAttribute('value'), newRank);
        },
        sort: function (event, ui) {
        },
        start: function (event, ui) {
          ui.helper.height(ui.helper.height() - 10);
          ui.helper.width(ui.helper.width() - 10);
          ui.placeholder.width(ui.helper.width());
          //ui.placeholder.width(ui.item.width());
        },
        receive: function (event, ui) {


        },
        cancel: '.nondraggable',
        forceHelperSize: true,
        helper: 'clone',
        zIndex: 9999,
        placeholder: 'vote vote-placeholder'
    });

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
      var contractBallot = getContract().ballot;
      var ballot = new Array();

      var keys = [],
          k, i, len;

      //Sort by Rank on DB
      for (var i = 0; i < contractBallot.length; i++) {
        if (contractBallot[i].rank) {
          keys.push(contractBallot[i].rank);
        }
      };
      keys.sort();
      for (i = 0; i < keys.length; i++) {
        for (k = 0; k < contractBallot.length; k++) {
          if (contractBallot[k].rank == keys[i]) {
            ballot[i] = contractBallot[k];
          }
        }
      }


/*      for (i = 0; i < contractBallot.length; i++) {
        if (contractBallot[i].rank != undefined && contractBallot[i].rank != null) {
          ballot[contractBallot[i].rank] = contractBallot[i];
        } else {
          contractBallot[i].rank = i;
          ballot.push(contractBallot[i]);
        }
      }*/

      var fork;
      Session.set('unauthorizedFork', false);
      for (fork in ballot) {
        if (getContract(ballot[fork]._id) != undefined) {
          var forkContract = getContract(ballot[fork]._id);
          authorization = forkContract.authorized;
          hasDefinition = forkContract.isDefined;
          if (authorization != undefined) {
            if (hasDefinition == true) {
              ballot[fork].authorized = authorization;
              if (authorization == false) {
                Session.set('unauthorizedFork', true);
              }
            } else {
              ballot[fork].authorized = true;
            }
            ballot[fork].keyword = forkContract.keyword;
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
    preferenceRank: function () {
      if (this.preference == undefined) {
        return rank++;
      }
    },
    action: function () {
        if (this.authorized == false) {
          return 'undefined';
        }
    },
    option: function (mode) {
      switch(Session.get('stage')) {
        case 'draft':
          return 'disabled';
        default:
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
