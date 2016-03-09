if (Meteor.isClient) {

  Template.ballot.rendered = function () {
      console.log('loading jquery calendar' + this.find('#date-picker'));

      //Calendar component
      if (this.find('#date-picker')) {
        $('#date-picker').datepicker();

        $('#date-picker').on('changeDate', function (e) {
          currentDate = new Date;
          if (currentDate.getTime() < e.date.getTime()) {
            Session.set('backdating', false);
            Meteor.call('updateContractField', getContract()._id, "closingDate", e.date);
          } else {
            Session.set('backdating', true);
          }
        });
      }

      //Dragable options
      this.$('#ballot-option').sortable({
          stop: function(e, ui) {
          },
          sort: function (event, ui) {
          },
          start: function (event, ui) {
          },
          receive: function (event, ui) {
          },
          cancel: '.nondraggable',
          //connectWith: ".connectedSortable",
          forceHelperSize: true,
          helper: 'clone',
          zIndex: 9999,
          placeholder: 'tag tag-placeholder'
      });

  };

  Template.ballot.helpers({
    closingDate: function () {
      var d = new Date()
      d = getContract().closingDate;
      return d.format('{Month} {d}, {yyyy}');
    },
    allowForks: function () {
      if (getContract().allowForks == true) {
        return 'toggle-activated';
      }
    },
    secretVotes: function () {
      if (getContract().secretVotes == true) {
        return 'toggle-activated';
      }
    },
    options: function () {
      var ballot = getContract().ballot;
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
      switch (mode.toLowerCase()) {
        case 'authorize': return 'vote-authorize';
        case 'reject': return 'vote-authorize unauthorized';
        case 'fork':
          if (this.authorized) {
            return 'vote-edit vote-custom';
          } else {
            return 'vote-edit vote-custom unauthorized';
            Session.set('unauthorizedFork', true);
          }
      }
    },

    action: function () {
        if (this.authorized == false) {
          return 'undefined';
        }
    },

    caption: function (mode) {
      if (mode.toLowerCase() != 'fork') {
        return TAPi18n.__(mode);
      } else {
        return this.label;
      }
    },
    tick: function (draftView) {
      if (draftView) { return 'disabled' };
    },
    remove: function (mode) {
      switch (mode.toLowerCase()) {
        case 'authorize':
        case 'reject':
          return false;
        case 'fork':
          return true;
      }
    }
  });

  Template.ballot.events({
    "click #toggle-allowForks": function () {
      Meteor.call("updateContractField", getContract()._id, "allowForks", !getContract().allowForks);
    },
    "click #toggle-secretVotes": function () {
      Meteor.call("updateContractField", getContract()._id, "secretVotes", !getContract().secretVotes);
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
    "click #ballot-checkbox": function () {
      Session.set('disabledCheckboxes', true);
    },

    "click #remove-fork": function () {
      Meteor.call("removeFork", getContract()._id, this._id);
    }
  });

}
