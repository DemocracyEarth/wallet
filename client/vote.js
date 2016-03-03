if (Meteor.isClient) {

  Meteor.subscribe("tags");

  // Constant Settings
  var $LANGUAGE = "en";
  var MAX_TAGS_PER_CONTRACT = 10;
  var TITLE_MAX_LENGTH = 100;
  var SERVER_INTERVAL = 5000;  //time in ms, 5 second for example

  var typingTimer;                //timer identifier

  var firstLoad = true;
  var editorContent = '';


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
          // get the dragged html element and the one before
          //   and after it
          el = ui.item.get(0)
          before = ui.item.prev().get(0)
          after = ui.item.next().get(0)

          // Here is the part that blew my mind!
          //  Blaze.getData takes as a parameter an html element
          //    and will return the data context that was bound when
          //    that html element was rendered!
          if(!before) {
            //if it was dragged into the first position grab the
            // next element's data context and subtract one from the rank
            newRank = Blaze.getData(after).rank - 1
          } else if(!after) {
            //if it was dragged into the last position grab the
            //  previous element's data context and add one to the rank
            newRank = Blaze.getData(before).rank + 1
          }
          else
            //else take the average of the two ranks of the previous
            // and next elements
            newRank = (Blaze.getData(after).rank +
                       Blaze.getData(before).rank)/2

          //update the dragged Item's rank
          //Items.update({_id: Blaze.getData(el)._id}, {$set: {rank: newRank}})
        },
        connectWith: ".connectedSortable"
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
      return verifyTags();
    },
    /* Tags are used for:
     * 1) Semantic description of a contract.
     * 2) Scope of power delegation between peers.
     * 3) Consist of agreed definitions.
     * 4) Are voted.
    */
    getTags: function() {
      var search = TagSearch.getData({
        transform: function(matchText, regExp) {
          return matchText.replace(regExp, "<b>$&</b>")
        },
        sort: {isoScore: -1}
      });
      return search
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
      return Session.get('maxReached');
    },
    duplicateTags: function() {
      return displayTimedWarning ('duplicateTags');
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
    "input #tagSearch": function (event) {
      var content = document.getElementById("tagSearch").innerHTML;//jQuery($("#tagSearch").html()).text();
      TagSearch.search(content);
    },
    "focus #tagSearch": function (event) {
      document.getElementById("tagSearch").innerHTML = '';
      Session.set('searchBox', true);
    },
    "blur #tagSearch": function (event) {
      document.getElementById("tagSearch").innerHTML = TAPi18n.__('search-tag');
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
      console.log('loading with ContractId: ' + Session.get('contractId'));
      return Contracts.findOne( { _id: Session.get('contractId') } );
    } else if (Session.get('voteKeyword') != undefined) {
      var contract = Contracts.findOne( { keyword: Session.get('voteKeyword') } );
      Session.set('contractId', contract._id);
      return contract;
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
