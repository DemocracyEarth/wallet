if (Meteor.isClient) {

  Template.ballot.rendered = function () {
    
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
      switch (mode) {
        case 'AUTHORIZE':
          return 'vote-authorize';
        case 'REJECT':
          return 'vote-authorize unauthorized';
        case 'FORK':
          if (this.authorized) {
            return 'vote vote-alternative';
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
