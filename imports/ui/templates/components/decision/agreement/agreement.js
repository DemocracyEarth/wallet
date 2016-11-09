import { Meteor, Deps } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { Contracts } from '/imports/api/contracts/Contracts';
import { saveDescription } from '/lib/data';
import { timers } from '/lib/const';
import { delegationTextCheck, stripHTMLfromText } from '/imports/ui/modules/utils';

import './agreement.html';

let typingTimer; // timer identifier

Template.agreement.onRendered = function onRender() {
  if (!Session.get('contract')) { return; }

  if (Session.get('contract').stage == 'DRAFT' && Session.get('contract').kind == 'VOTE') {
    // FIX MediumEditor is not defined
    var editor = new MediumEditor('#editor', {
      /* These are the default options for the editor,
          if nothing is passed this is what is used */
      activeButtonClass: 'medium-editor-button-active',
      toolbar: {
        //buttons: ['bold', 'italic', 'anchor', 'unorderedlist', 'orderedlist', 'quote'],
        buttons: [
          {
            name: 'bold',
            contentDefault: '<strong class="icon-bold">B</strong>'
          }, {
              name: 'italic',
              contentDefault: '<i class="icon-italic">i</i>'
          }, {
              name: 'quote',
              contentDefault: '<span class="icon-quote">&#8220;</span>',
          }, {
              name: 'anchor',
              contentDefault: '<img src="/images/link-icon.png" style=" width: 14px; height: 14px; ">',
          }, {
              name: 'unorderedlist',
              contentDefault: '<span class="icon-list-bullet">&#8226;</span>'
          }, {
              name: 'orderedlist',
              contentDefault: '<span class="icon-list-numbered">1.</span>'
          }
        ],
        diffLeft: 0,
        diffTop: -15,
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
      sticky: false,
      static: false,
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
      }, timers.SERVER_INTERVAL);
    });

    $('.right').scroll(function(event) {
      editor.trigger('blur', event);
    });

    //to avoid duplicate fragments + caret displacement, it manually handles contenteditable update
    var t = this;
    this.contentAutorun = Deps.autorun(function () {
        var content = Contracts.findOne( { _id: contractId }, {reactive: false} );

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

Template.agreement.helpers({
  sampleMode: function () {
    if (Session.get('missingDescription')) {
      return 'sample';
    } else {
      return '';
    }
  },
  description: function () {
    if (contractId != undefined) {
      var description = Contracts.findOne( { _id: contractId }, { reactive: false } ).description;
      return delegationTextCheck(description, true);
    }
  },
  emptyDescription: function () {
    if (Session.get('contract').description == "") {
      return true;
    } else {
      return false;
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
    var content = stripHTMLfromText(document.getElementById("editor").innerHTML);
    if (content.length <= 1) {
      Session.set('missingDescription',true);
      document.getElementById("editor").innerText = TAPi18n.__('placeholder-editor');
    }
  }
});
