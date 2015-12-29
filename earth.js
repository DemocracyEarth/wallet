/*

_____                                                   ______           _   _
|  __ \                                                 |  ____|         | | | |
| |  | | ___ _ __ ___   ___   ___ _ __ __ _  ___ _   _  | |__   __ _ _ __| |_| |__
| |  | |/ _ \ '_ ` _ \ / _ \ / __| '__/ _` |/ __| | | | |  __| / _` | '__| __| '_ \
| |__| |  __/ | | | | | (_) | (__| | | (_| | (__| |_| |_| |___| (_| | |  | |_| | | |
|_____/ \___|_| |_| |_|\___/ \___|_|  \__,_|\___|\__, (_)______\__,_|_|   \__|_| |_/
                                                  __/ |
                                                 |___/
version: 0.00000001
codename: satoshi

"You never change things by fighting the existing reality. To change something
build a new model that makes the existing model obsolete."
@BuckminsterFuller

*/


if (Meteor.isClient) {

  Meteor.subscribe("tags");

  // Settings
  var $LANGUAGE = "en";
  var MAX_TAGS_PER_CONTRACT = 10;

  Meteor.startup(function () {

    //Setup Language
    Session.set("showLoadingIndicator", true);

    TAPi18n.setLanguage(getUserLanguage())
      .done(function () {
        Session.set("showLoadingIndicator", false);
      })
      .fail(function (error_message) {
        // Handle the situation
        console.log(error_message);
      });

  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  /***********************
  Rendering
  ***********************/

  Template.ballot.rendered = function () {
      console.log('loading jquery calendar' + this.find('#date-picker'));

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

      //ADD EVENT: When loaded  set  the date in the calendar.

  };

  /***********************
  Helpers
  **********************/

  Template.body.helpers({
    draftView: function() {
        return true;
    }
  });


  //Mileston status of current contract
  Template.milestone.helpers({
    status: function(number, currentStep) {
        if (number < currentStep) {
          return '';
        } else if (number == currentStep) {
          return 'current';
        } else {
          return 'disabled';
        }
    },
    text: function(number) {
      return TAPi18n.__('milestone_' + number.toString());
    },
    tick: function(number, currentStep) {
      if (number < currentStep) {
          return '&#10003;';
      } else {
        return number;
      }
    },
    progressbar: function(number, max, currentStep) {
      if (number < max) {
        if (number < currentStep) {
          return 'progress-bar completed';
        } else {
          return 'progress-bar';
        }
      } else {
        return '';
      }
    }
  });

  Template.contract.helpers({
    description: function() {
      return getContract().description;
    },
    semantics: function () {
      return verifyTags();
    },
    /* Tags are used for:
     * 1) Semantic description of a contract.
     * 2) Scope of power delegation between peers.
     * 3) Consist of agreed definitions.
     * 4) Are voted.
    */
    tags: function() {
      return Tags.find({}, {sort: {text: 1} });
    },
    unauthorizedTags: function() {
      return Session.get('unauthorizedTags');
    },
    maxReached: function () {
      return Session.get('maxReached');
    },
    duplicateTags: function() {
      return displayTimedWarning ('duplicateTags');
    },
    voteKeyword: function () {
      return Session.get('voteKeyword');
    }
  });

  // Title of Contract
  Template.title.helpers({
    declaration: function() {
        return getContract().title;
    }
  });

  Template.kind.helpers({
    text: function() {
        switch(getContract().kind) {
          case 'VOTE':
            return  TAPi18n.__('voting_ballot');
            break;
          case 'property':
            break;
          default:
            return "TBD";
        }
    }
  });

  Template.tag.helpers({
    authorization: function (hover) {
      if (this._id != undefined) {
        if (Tags.findOne(this._id).isDefined == false) {
          //specific CSS class
          if (hover) {
            return 'undefined';
          } else {
            return 'unauthorized';
          }
        } else {
          return 'authorized';
        }
      }
    }
  });

  Template.authors.helpers({
    anonymous: function() {
        if (getContract().anonymous == true) {
          return 'toggle-activated';
        }
      }
    });

  Template.ballot.helpers({
    closingDate: function () {
      var d = new Date()
      d = getContract().closingDate;
      return d.format('{d} {Month}, {yyyy}');
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

  /***********************
  Event Handlers
  **********************/

  Template.contract.events({
    "submit .title-form": function (event) {
      event.preventDefault();
      Meteor.call("updateContractField", getContract()._id, "title", event.target.title.value);
    },
    "submit .description-form": function (event) {
      event.preventDefault();
      Meteor.call("updateContractField", getContract()._id, "description", event.target.description.value);
    },
    "submit #tag-form, click #add-custom-tag": function (event) {
      event.preventDefault();
      Meteor.call("addCustomTagToContract", getContract()._id, document.getElementById('text-custom-tag').value, function (error) {
        if (error && error.error == 'duplicate-tags') {
          Session.set('duplicateTags', true)
        }
      });
      Meteor.setTimeout(function () {document.getElementById('text-custom-tag').value = '';}, 100);
    },
    "click #add-suggested-tag": function (event) {
      Meteor.call("addTagToContract", getContract()._id, this._id, function (error) {
          if (error && error.error == 'duplicate-tags') {
            Session.set('duplicateTags', true)
          }
      });
    }
  });

  Template.tag.events({
    "click #tag-remove": function (event, template) {
      Meteor.call("removeTagFromContract", getContract()._id, this._id);
    }
  });

  Template.authors.events({
    "click #toggle-anonymous": function () {
      Meteor.call("updateContractField", getContract()._id, "anonymous", !getContract().anonymous);
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

  Template.execution.events({
      "click .contract-save-draft": function (event) {
        //Get all info from current draft
        var newContract = new contract(
          document.getElementById('contract-title').value,
          document.getElementById('contract-description').value,
          getContract().tags
        );
        Meteor.call("updateContract", getContract()._id, newContract);
      }
  });

}

//Global Methods
getUserLanguage = function () {
  // Put here the logic for determining the user language
  return $LANGUAGE;
};

getContract = function (contractId) {
  console.log('contract id is ' + Session.get('voteKeyword'));
  if (contractId != undefined ) {
    return Contracts.findOne( { _id: contractId } );
  } else {
    if (Session.get('voteKeyword') != undefined) {
      return Contracts.findOne( { keyword: Session.get('voteKeyword') } );
    }
  }
}

displayTimedWarning = function (warning) {
  if (Session.get(warning)) {
    Meteor.setTimeout(function () {Session.set(warning, false)}, 5000);
  }
  return Session.get(warning);
}

verifyTags = function () {
  var tagDetails = [];
  var tagList = getContract().tags;

  //Verify if it has a definition
  Session.set('unauthorizedTags', false);
  for (var i=0; i < tagList.length; i++) {
    tagDetails.push(Tags.find({ _id: tagList[i]._id}).fetch());
    if (tagDetails[i][0] != undefined) {
      if (tagDetails[i][0].isDefined == false) {
        Session.set('unauthorizedTags', true);
        break;
      }
    }
  }
  //Verify if reached maximum
  if (tagList.length >= MAX_TAGS_PER_CONTRACT) {
    Session.set('maxReached', true);
  } else {
    Session.set('maxReached', false);
  }

  return tagList;
}

contract = function (title, description, tags) {
  this.title = title;
  this.description = description;
  this.tags = tags;
}

/*warning = function(unauthorizedTags, reachedMaxTags) {
  this.unauthorizedTags = unauthorizedTags;
  this.reachedMaxTags = reachedMaxTags;
}*/
