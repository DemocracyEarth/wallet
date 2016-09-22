var typingTimer; //timer identifier

/***********************
Rendering
***********************/

Template.agreement.rendered = function () {

  if (Session.get('contract').stage == 'DRAFT' && Session.get('contract').kind == 'VOTE') {

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
        var content = Contracts.findOne( { _id: Session.get('contract')._id }, {reactive: false} );

        if (t.find(".cr-note") != null) {
          if (content) {
            if (content.description.length <= 1) {
              t.find(".cr-note").innerHTML = TAPi18n.__('placeholder-editor');
              Session.set('missingDescription', true);
            } else {
              t.find(".cr-note").innerHTML = content.description;
              Session.set('missingDescription', false);
            }
          }
        }
    });
  }
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
  },
  description: function () {
    return dynamicTextCheck(Session.get('contract').description);
  }
});


/***********************
Event Handlers
**********************/

Template.agreement.events({
  "focus #editor": function (event) {
    if (Session.get('missingDescription')) {
      document.getElementById("editor").innerText = '';
      Session.set('missingDescription',false);
    }
  },
  "blur #editor": function (event) {
    var content = Modules.client.stripHTMLfromText(document.getElementById("editor").innerHTML);
    if (content.length <= 1) {
      Session.set('missingDescription',true);
      document.getElementById("editor").innerText = TAPi18n.__('placeholder-editor');
    }
  }
});

/***********************
Local methods
**********************/

function dynamicTextCheck(text) {
  var checkedText = new String(text);
  var htmlTagOpen = new String ("<a href='#'>");
  var htmlTagClose = new String ("</a>");
  var roleIndex = new Object();
  switch (Session.get('contract').kind) {
    case KIND_DELEGATION:
      var signatures = Session.get('contract').signatures;
      if (signatures.length > 0) {
        for (var i = 0; i < signatures.length; i ++) {
          Modules.both.getUserInfo(signatures[i]._id, signatures[i].role);
          roleIndex[signatures[i].role] = i;
        }
      }
      if (Session.get('DELEGATOR') != undefined) {
        checkedText = checkedText.replace('<delegator>', htmlTagOpen + getProfileName(Session.get('DELEGATOR').profile) + htmlTagClose);
        checkedText = checkedText.replace('<delegate>', htmlTagOpen + getProfileName(Session.get('DELEGATE').profile) + htmlTagClose);
        checkedText = checkedText.replace('<votes>', Session.get('newVote').allocateQuantity);
      }
      break;
  }
  return checkedText;
}

function getProfileName (profile) {
  fullName = new String();
  if (profile.firstName != undefined) {
    fullName = profile.firstName;
  }
  if (profile.lastName != undefined) {
    fullName += ' ' + profile.lastName;
  }
  return fullName;
}
