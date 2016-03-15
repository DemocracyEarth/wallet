if (Meteor.isClient) {

  Meteor.subscribe("tags");

  // Constant Settings
  $LANGUAGE = "en";
  TITLE_MAX_LENGTH = 100;
  SERVER_INTERVAL = 5000;  //time in ms, 5 second for example

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

  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  /***********************
  Rendering
  ***********************/


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



  /***********************
  Helpers
  **********************/

  Template.vote.helpers({
    draftView: function() {
      //Session.get('stage', 'draft');
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

  Template.authors.helpers({
    anonymous: function() {
        if (getContract().anonymous == true) {
          return 'toggle-activated';
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
    "submit .title-form": function (event) {
      event.preventDefault();
      Meteor.call("updateContractField", getContract()._id, "title", event.target.title.value);
    },
    "submit .description-form": function (event) {
      event.preventDefault();
      Meteor.call("updateContractField", getContract()._id, "description", event.target.description.value);
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
