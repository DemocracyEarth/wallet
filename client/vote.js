if (Meteor.isClient) {

  Meteor.subscribe("tags");

  // Constant Settings
  var $LANGUAGE = "en";
  var MAX_TAGS_PER_CONTRACT = 10;
  var MIN_TAGS_PER_CONTRACT = 3;
  var TITLE_MAX_LENGTH = 100;
  var SERVER_INTERVAL = 5000;  //time in ms, 5 second for example

  var typingTimer; //timer identifier


  Meteor.startup(function () {

    //Setup Language
    Session.set("showLoadingIndicator", true);

    //Internationalizatoin Library
    TAPi18n.setLanguage(getUserLanguage())
      .done(function () {
        Session.set("showLoadingIndicator", false);
      })
      .fail(function (error_message) {
        // Handle the situation
        console.log(error_message);
      });

    var options = {
      keepHistory: 1000 * 60 * 5,
      localSearch: true
    };
    var fields = ['text', 'url'];

    Session.set('createTag', false);
    TagSearch = new SearchSource('tags', fields, options);

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

  Template.agreement.rendered = function () {
    var editor = new MediumEditor('.editable', {
      /* These are the default options for the editor,
          if nothing is passed this is what is used */
      activeButtonClass: 'medium-editor-button-active',
      toolbar: {
        buttons: ['bold', 'italic', 'anchor', 'h2', 'h3', 'unorderedlist', 'quote'],
        diffLeft: 25,
        diffTop: -10,
        allowMultiParagraphSelection: true
      },
      buttonLabels: false,
      contentWindow: window,
      delay: 0,
      disableReturn: false,
      disableDoubleReturn: false,
      disableExtraSpaces: false,
      disableEditing: false,
      autoLink: true,
      elementsContainer: false,
      extensions: {},
      ownerDocument: document,
      spellcheck: true,
      targetBlank: true,
      anchor: {
        placeholderText: TAPi18n.__('type-link'),
        linkValidation: true
      },
      paste: {
          forcePlainText: true,
          cleanPastedHTML: true,
          cleanAttrs: ['style', 'dir'],
          cleanTags: ['label', 'meta']
      },
      anchorPreview: {
          hideDelay: 0
      },
      placeholder: {
          text: TAPi18n.__('placeholder-editor')
      }
    });

    editor.subscribe('editableInput', function(event, editable) {
      Meteor.clearTimeout(typingTimer);
      typingTimer = Meteor.setTimeout(function () {
        saveDescription(editor.serialize().editor.value);
      }, SERVER_INTERVAL);
    });
  };

  Template.contract.rendered = function () {
    this.$('#tagSuggestions, #tagList').sortable({
        stop: function(e, ui) {
          Session.set('removeTag', false);
        },
        start: function (event, ui) {
          ui.helper.width(ui.helper.width() + 3);
          ui.placeholder.width(ui.item.width());
          if (this.id == "tagList") {
            Session.set('removeTag', true);
          }
        },
        receive: function (event, ui) {
          var tagList = Contracts.findOne( { _id: Session.get('contractId') }, {reactive: false} ).tags;

          if (this.id == 'tagSuggestions') {
            if (Session.get('removeTag')) {
              removeTag(ui.item.get(0).getAttribute('value'));
              ui.item.get(0).remove();
              Session.set('removeTag', false);
            }
            Session.set('maxReached', false);
            Session.set('duplicateTags', false);
          } else if (this.id == 'tagList') {
            if (tagList.length >= MAX_TAGS_PER_CONTRACT) {
              //Max reached
              Session.set('maxReached', true);
              ui.item.get(0).remove();
            } else if (checkDuplicate(tagList,ui.item.get(0).getAttribute('value'))) {
              //There's a duplicate
              Session.set('duplicateTags', true);
              ui.item.get(0).remove();
            } else {
              //Add the tag
              Session.set('maxReached', false);
              addTag(ui.item.get(0).getAttribute('value'));
            }
          }
        },
        cancel: '.nondraggable',
        connectWith: ".connectedSortable",
        forceHelperSize: true,
        helper: 'clone',
        zIndex: 9999,
        placeholder: 'tag tag-placeholder'

        //placeholder: "tag-drag"
    });
    TagSearch.search('');
  }

  /***********************
  Helpers
  **********************/

  Template.vote.helpers({
    draftView: function() {
      Session.get('stage', 'draft');
    }
  });

  Template.agreement.helpers({
    descriptionEditor: function() {
      if (descriptionHTML != '') {
        var descriptionHTML = Contracts.findOne( { _id: Session.get('contractId') },{reactive: false} ).description;
        return descriptionHTML;
      };
    },
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
    semantics: function () {
      var tagDetails = [];
      var tagList = Contracts.findOne( { _id: Session.get('contractId') }, {reactive: false} ).tags;

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
    },
    getTags: function() {
      var search = TagSearch.getData({
        transform: function(matchText, regExp) {
          return matchText.replace(regExp, "<b>$&</b>")
        },
        sort: {isoScore: -1}
      });
      return search;
    },
    createTag: function () {
      return displayElement('createTag');
    },
    removeTag: function () {
      return displayElement('removeTag');
    },
    newTag: function () {
      return Session.get('newTag');
    },
    searchBox: function () {
      if (Session.get('searchBox')) {
        return 'search-active';
      } else {
        return '';
      }
    },
    unauthorizedTags: function() {
      return Session.get('unauthorizedTags');
    },
    maxReached: function () {
      return displayTimedWarning('maxReached');
    },
    minTags: function () {
      return displayTimedWarning('minTags');
    },
    duplicateTags: function() {
      return displayTimedWarning('duplicateTags');
    },
    voteKeyword: function () {
      return Session.get('voteKeyword');
    },
    sample: function () {
      return Session.get('searchSample');
    }
  });

  // Title of Contract
  Template.title.helpers({
    declaration: function() {
        return  Contracts.findOne( { _id: Session.get('contractId') },{reactive: false} ).title;
    },
    contractURL: function () {
      var host =  window.location.host;
      var keyword = '';

      if (Session.get('contractKeyword') == undefined) {
        Session.set('contractKeyword', getContract().keyword);
      } else if (Session.get('contractKeyword') != getContract().keyword) {
        keyword = Session.get('contractKeyword');
      } else {
        keyword = getContract().keyword;
      }

      return host + "/" + Session.get('kind') + "/<strong>" + keyword + "</strong>";
    },
    URLStatus: function () {
      switch (Session.get("URLStatus")) {
        case "VERIFY":
          return "<strong data-new-link='true' class='state verifying'>" + TAPi18n.__('url-verify') + "</strong>";
          break;
        case "UNAVAILABLE":
          Session.set('duplicateURL', true);
          return "<strong data-new-link='true' class='state unavailable'>" + TAPi18n.__('url-unavailable') + "</strong>";
          break;
        case "AVAILABLE":
          Session.set('duplicateURL', false);
          return "<strong data-new-link='true' class='state available'>" + TAPi18n.__('url-available') + "</strong>";
          break;
      }
    },
    duplicateURL: function () {
      return Session.get('duplicateURL');
    },
    titleLength: function () {
      return TITLE_MAX_LENGTH;
    },
    timestamp: function () {
      var d = new Date;
      d = getContract().timestamp;
      return d.format('{Month} {d}, {yyyy}');
    }
  });

  Template.kind.helpers({
    text: function() {
        var kind = getContract().kind;

        switch(kind) {
          case 'VOTE':
            Session.set('kind', kind.toLowerCase());
            switch (getContract().stage) {
              case 'DRAFT':
                Session.set('stage', 'draft');
                return  TAPi18n.__('kind-draft-vote');
                break;
              case 'LIVE':
                Session.set('stage', 'live');
                return  TAPi18n.__('kind-live-vote');
                break;
              case 'APPROVED':
                Session.set('stage', 'finish-approved');
                return  TAPi18n.__('kind-finish-vote-approved');
                break;
              case 'ALTERNATIVE':
                Session.set('stage', 'finish-alternative');
                return  TAPi18n.__('kind-finish-vote-alternative');
                break;
              case 'REJECTED':
                Session.set('stage', 'finish-rejected');
                return  TAPi18n.__('kind-finish-vote-rejected');
                break;
            }
            break;
          default:
            return "TBD";
        }
    },
    style: function () {
      return 'stage stage-' + Session.get('stage');
    }
  });

  Template.tag.helpers({
    authorization: function (hover) {
      return 'authorized';
/*      if (this._id != undefined) {
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
      }*/
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

  /***********************
  Event Handlers
  **********************/

  Template.contract.events({
    "input #titleEditable": function (event) {
        var content = jQuery($("#titleEditable").html()).text();
        var keyword = convertToSlug(content);
        var contract = Contracts.findOne( { keyword: keyword } );

        Meteor.clearTimeout(typingTimer);
        Session.set('contractKeyword', keyword);
        Session.set('URLStatus', 'VERIFY');

        typingTimer = Meteor.setTimeout(function () {
          if (contract != undefined && contract._id != Session.get('contractId')) {
              Session.set('URLStatus', 'UNAVAILABLE');
          } else {
            if (Contracts.update({_id : getContract()._id }, { $set: { title: content, keyword: keyword, url: "/" + Session.get('kind') + "/" + keyword }})) {
              Session.set('URLStatus', 'AVAILABLE');
            };
          }
        }, SERVER_INTERVAL);
    },
    "keypress #tagSearch": function (event) {
      return event.which != 13;
    },
    "input #tagSearch": function (event) {
      var content = document.getElementById("tagSearch").innerHTML.replace(/&nbsp;/gi,'');
      TagSearch.search(content);

      if (TagSearch.getData().length == 0) {
        Session.set('createTag', true);
        Session.set('newTag', content);
      } else {
        Session.set('createTag', false);
      }
    },
    "focus #tagSearch": function (event) {
      document.getElementById("tagSearch").innerHTML = '';
      Session.set('searchBox', true);
    },
    "blur #tagSearch": function (event) {
      if (Session.get('createTag') == false) {
        resetTagSearch();
      }
      Session.set('searchBox', false);
    },
    "submit .title-form": function (event) {
      event.preventDefault();
      Meteor.call("updateContractField", getContract()._id, "title", event.target.title.value);
    },
    "submit .description-form": function (event) {
      event.preventDefault();
      Meteor.call("updateContractField", getContract()._id, "description", event.target.description.value);
    },
    "click #add-custom-tag": function (event) {
      var customTag = document.getElementById("tagSearch").innerHTML.replace(/&nbsp;/gi,'');
      event.preventDefault();

      Meteor.call("addCustomTagToContract", getContract()._id, customTag, function (error) {
        if (error && error.error == 'duplicate-tags') {
          Session.set('duplicateTags', true)
        }
      });
      Meteor.setTimeout(function () {
        resetTagSearch();
      }, 100);

    },
    "click #add-suggested-tag": function (event) {
      addTag(this._id);
    }
  });

  Template.tag.events({
    "click #tag-remove": function (event, template) {
      removeTag(this._id);
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

addTag = function (tagId) {
  Meteor.call("addTagToContract", Session.get('contractId'), tagId, function (error) {
      if (error && error.error == 'duplicate-tags') {
        Session.set('duplicateTags', true)
      }
  });
}

removeTag = function(tagId) {
  Meteor.call("removeTagFromContract", Session.get('contractId'), tagId);
}

resetTagSearch = function () {
  TagSearch.search('');
  document.getElementById("tagSearch").innerHTML = TAPi18n.__('search-tag');
  Session.set('createTag', false);
}

function checkDuplicate (arr, elementId) {
  for (var i = 0; i < arr.length; i++ ) {
    if (arr[i]._id == elementId ) {
      return true;
    }
  }
  return false;
}

saveDescription = function (newHTML) {
  if (newHTML != getContract().description) {
    //Meteor.call("updateContractField", getContract()._id, "description", newHTML);
    Contracts.update(Session.get('contractId'), { $set: { description: newHTML} });
    console.log('[description] saved HTML changes');
  }
}

getContract = function (contractId) {
  //console.log('contract id is ' + Session.get('voteKeyword'));
  if (contractId != undefined ) {
    return Contracts.findOne( { _id: contractId } );
  } else {
    if (Session.get('contractId') != undefined) {
      return Contracts.findOne( { _id: Session.get('contractId') } );
    } else if (Session.get('voteKeyword') != undefined) {
      var contract = Contracts.findOne( { keyword: Session.get('voteKeyword') } );
      Session.set('contractId', contract._id);
      return contract;
    }
  }
}

displayElement = function (sessionVar) {
  if (Session.get(sessionVar)) {
    return '';
  } else {
    return 'display:none';
  }
}

displayTimedWarning = function (warning) {
  if (Session.get(warning)) {
    Meteor.setTimeout(function () {Session.set(warning, false)}, 5000);
  }
  return Session.get(warning);
}

contract = function (title, description, tags) {
  this.title = title;
  this.description = description;
  this.tags = tags;
}

convertToSlug = function (text) {
  //makes any "string with free speech" into a "string-with-digital-speech"
  return text
      .toLowerCase()
      .replace(/ /g,'-')
      .replace(/[^\w-]+/g,'')
      ;
}

/*warning = function(unauthorizedTags, reachedMaxTags) {
  this.unauthorizedTags = unauthorizedTags;
  this.reachedMaxTags = reachedMaxTags;
}*/
