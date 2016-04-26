if (Meteor.isClient) {

  Meteor.subscribe("tags");

  var typingTimer; //timer identifier
  var editorCaretPosition;

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
    var editor = new MediumEditor('#editor', {
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
    });

    editor.subscribe('editableInput', function(event, editable) {
      Meteor.clearTimeout(typingTimer);
      typingTimer = Meteor.setTimeout(function () {
        if (Session.get('missingDescription') == false) {
          saveDescription(document.getElementById('editor').innerHTML);
        } else {
          saveDescription('');
        }
      }, SERVER_INTERVAL);
    });

    //to avoid duplicate fragments + caret displacement, it manually handles contenteditable update
    var t = this;
    this.contentAutorun = Deps.autorun(function () {
        var content = Contracts.findOne( { _id: Session.get('contractId') }, {reactive: false} );
        if (content) {
          if (content.description.length <= 1) {
            t.find(".cr-note").innerHTML = TAPi18n.__('placeholder-editor');
            Session.set('missingDescription', true);
          } else {
            t.find(".cr-note").innerHTML = content.description;
            Session.set('missingDescription', false);
          }
        }
    });

  };



  /***********************
  Helpers
  **********************/

  Template.agreement.helpers({
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
        document.getElementById("editor").innerText = '';
        Session.set('missingDescription',false);
      }
    },
    "blur #editor": function (event) {
      var content = strip(document.getElementById("editor").innerHTML);
      if (content.length <= 1) {
        Session.set('missingDescription',true);
        document.getElementById("editor").innerText = TAPi18n.__('placeholder-editor');
      }
    }
  });

  Template.authors.events({
    "click #toggle-anonymous": function () {
      Meteor.call("updateContractField", getContract()._id, "anonymous", !getContract().anonymous);
    }
  });

}
