if (Meteor.isClient) {

  Meteor.subscribe("tags");

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
          cleanTags: ['label', 'meta', 'div', 'span']
      },
      anchorPreview: {
          hideDelay: 0
      },
      placeholder: false
      //{
          //text: TAPi18n.__('placeholder-editor')
      //}
    });

    editor.subscribe('editableInput', function(event, editable) {
      Meteor.clearTimeout(typingTimer);
      typingTimer = Meteor.setTimeout(function () {
        console.log('now calls the save function for: ' + document.getElementById('editor').innerHTML);
        //saveDescription(editor.serialize().editor.value);
        saveDescription(document.getElementById('editor').innerHTML);
      }, SERVER_INTERVAL);
    });
  };



  /***********************
  Helpers
  **********************/

  Template.agreement.helpers({
    descriptionEditor: function() {
      var contract = Contracts.findOne( { _id: Session.get('contractId') }, { reactive: false } );
      var descriptionHTML = contract.description;
      var stripped = descriptionHTML.replace(/<\/?[^>]+(>|$)/g, "");

      var preHTML = "<div id='editor' class='cr-note' tabindex=0>";
      var postHTML = "</div>";

      console.log('CARET POSITION' + getCaretPosition(document.getElementById('editor')));

      //remove if pre tag already present in text
      descriptionHTML.replace(preHTML, '');
      descriptionHTML.replace(postHTML, '');
      descriptionHTML.replace(/<\/?[^>]+(>|$)/g, "");

      console.log('[descriptionEditor Helper] ' + descriptionHTML);

      if (stripped != '') {
        return preHTML + descriptionHTML + postHTML;
      } else {
        Session.set('missingDescription', true);
        return TAPi18n.__('placeholder-editor');
      }
    },
    sampleMode: function () {
      if (Session.get('missingDescription')) {
        return 'sample';
      } else {
        return '';
      }
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


  // Title of Contract
  Template.title.helpers({
    declaration: function() {
      var title = Contracts.findOne( { _id: Session.get('contractId') },{reactive: false} ).title;
      if (title == '' || title == undefined) {
        Session.set('missingTitle', true);
        return TAPi18n.__('no-title');
      } else {
        Session.set('missingTitle', false);
        return title;
      }
    },
    sampleMode: function() {
      if (Session.get('missingTitle')) {
        return 'sample';
      } else {
        return '';
      }
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
    missingTitle: function () {
      if (Session.get('missingTitle')) {
        Session.set('URLStatus', 'UNAVAILABLE');
      }
      return Session.get('missingTitle');
    },
    mistypedTitle: function () {
      return Session.get('mistypedTitle');
    },
    URLStatus: function () {
      switch (Session.get("URLStatus")) {
        case "VERIFY":
          return "<strong data-new-link='true' class='state verifying'>" + TAPi18n.__('url-verify') + "</strong>";
          break;
        case "UNAVAILABLE":
          //Session.set('duplicateURL', true);
          return "<strong data-new-link='true' class='state unavailable'>" + TAPi18n.__('url-unavailable') + "</strong>";
          break;
        case "AVAILABLE":
          //Session.set('duplicateURL', false);
          return "<strong data-new-link='true' class='state available'>" + TAPi18n.__('url-available') + "</strong>";
          break;
      }
    },
    duplicateURL: function () {
      return Session.get('duplicateURL');
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
    "input #titleContent": function (event) {
      var content = document.getElementById("titleContent").innerText;//jQuery($("#titleContent").html()).text();
      var keyword = convertToSlug(content);
      var contract = Contracts.findOne( { keyword: keyword } );

      //Set timer to check upload to db
      Meteor.clearTimeout(typingTimer);
      Session.set('contractKeyword', keyword);
      Session.set('URLStatus', 'VERIFY');

      //Checking content typed
      if (content == '') {
        Session.set('contractKeyword', keyword);
        Session.set('URLStatus', 'UNAVAILABLE');
        Session.set('missingTitle', true);
        return;
      } else if (keyword.length < 3) {
        Session.set('contractKeyword', keyword);
        Session.set('URLStatus', 'UNAVAILABLE');
        Session.set('mistypedTitle', true);
        Session.set('missingTitle', false);
        return;
      } else {
        Session.set('missingTitle', false);
        Session.set('mistypedTitle', false);
      }

      //Call function when typing seems to be finished.
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
    "keypress #titleContent": function (event) {
      var content = document.getElementById("titleContent").innerText;
      return (content.length <= TITLE_MAX_LENGTH) && event.which != 13;
    },
    "focus #titleContent": function (event) {
      if (Session.get('missingTitle')) {
        document.getElementById("titleContent").innerText = '';
        Session.set('missingTitle',false);
      }

    },
    "blur #titleContent": function (event) {
      var content = document.getElementById("titleContent").innerText;
      if (content == '' || content == ' ') {
        Session.set('missingTitle',true);
        document.getElementById("titleContent").innerText = TAPi18n.__('no-title');
      }
    }
  });

  Template.agreement.events({
    "focus #editor": function (event) {
      if (Session.get('missingDescription')) {
        document.getElementById("editor").innerText = '&nbsp;';
        Session.set('missingDescription',false);
      }
    },
    "blur #editor": function (event) {
      var content = document.getElementById("editor").innerText;
      if (content == '' || content == ' ') {
        Session.set('missingDescription',true);
        document.getElementById("editor").innerText = TAPi18n.__('placeholder-editor');
      }
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
