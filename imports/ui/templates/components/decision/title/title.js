import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { rules, timers } from '/lib/const';
import { placeCaretAtEnd } from '/imports/startup/both/modules/utils';
import { initEditor } from '/imports/ui/modules/editor';
import { stripHTMLfromText } from '/imports/ui/modules/utils';

import './title.html';
import '../stage/stage.js';
import '../../../widgets/warning/warning.js';

let typingTimer; // timer identifier

const getIndexArray = (search, text, caseSensitive) => {
  const searchStrLen = search.length;
  if (searchStrLen === 0) {
    return [];
  }
  const indices = [];
  let str = text;
  let searchStr = search;
  let startIndex = 0;
  let index;
  if (!caseSensitive) {
    str = text.toLowerCase();
    searchStr = search.toLowerCase();
  }
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + searchStrLen;
  }
  return indices;
};

/**
* @summary gets to current position of the cursor in contenteditable
*/
function getCaretPosition() {
  if (window.getSelection && window.getSelection().getRangeAt) {
    const range = window.getSelection().getRangeAt(0);
    const selectedObj = window.getSelection();
    let rangeCount = 0;
    const childNodes = selectedObj.anchorNode.parentNode.childNodes;
    for (let i = 0; i < childNodes.length; i += 1) {
      if (childNodes[i] === selectedObj.anchorNode) {
        break;
      }
      if (childNodes[i].outerHTML) {
        rangeCount += childNodes[i].outerHTML.length;
      } else if (childNodes[i].nodeType == 3) {
        rangeCount += childNodes[i].textContent.length;
      }
    }
    return range.startOffset + rangeCount;
  }
  return -1;
}

/**
* @summary saves new written or pasted content to contract draft
* @param {string} content new text
*/
const _saveToDraft = (content) => {
  const draft = Session.get('draftContract');

  // Checking content typed
  if (content === '' || content === ' ') {
    Session.set('missingTitle', true);
    return;
  }
  Session.set('missingTitle', false);

  // call function when typing seems to be finished.
  typingTimer = Meteor.setTimeout(() => {
    Session.set('draftContract', Object.assign(draft, { title: parseMarkup(content) }));
  }, timers.SERVER_INTERVAL);
};

/**
* @summary converts string text using markdown signals to HTML
* @param {string} text
*/
const parseMarkup = (text) => {
  // remove html injections
  const txt = text.replace(/<(?:.|\n)*?>/gm, '');

  return txt;
};

function displayTitle(title) {
  if (title === '' || title === undefined) {
    Session.set('missingTitle', true);
    return ' ';
  }
  // Session.set('missingTitle', false);
  return title; // textToHTML(title);
}

Template.title.onRendered(() => {
  initEditor();

  // text length
  Session.set('availableChars', rules.TITLE_MAX_LENGTH);

  // paste
  if (document.getElementById('titleContent') !== null) {
    document.getElementById('titleContent').addEventListener('paste', (e) => {
      e.preventDefault();
      const text = stripHTMLfromText(e.clipboardData.getData('text/plain'));
      const newtitle = $('#titleContent')[0].innerText;
      const delta = parseInt(rules.TITLE_MAX_LENGTH - newtitle.length, 10);
      if (rules.TITLE_MAX_LENGTH !== 0 && delta > 0) {
        document.execCommand('insertHTML', false, text);
      }
    });
  }
});

Template.titleContent.helpers({
  sampleMode() {
    if (Session.get('missingTitle')) {
      return 'sample';
    }
    return '';
  },
  declaration() {
    if (Session.get('draftContract')) {
      return displayTitle(Session.get('draftContract').title);
    }
    return displayTitle('');
  },
  editable() {
    const viewportHeight = 300;
    const html = `<div id='titleContent' contenteditable='true' style='min-height: ${viewportHeight}px' tabindex=0> ${this.toString()} </div>`;
    return html;
  },
  viewport() {
    return Session.get('editorViewportHeight');
  },
  text() {
    return this.toString();
  },
});

// Title of Contract
Template.title.helpers({
  declaration() {
    return displayTitle(this.title);
  },
  missingTitle() {
    return Session.get('missingTitle');
  },
});

Template.title.events({
  'click #emptyTitle'() {
    $('#titleContent').focus();
  },
});

Template.titleContent.events({
  'input #titleContent'() {
    let content = document.getElementById('titleContent').innerText;

    // Set timer to check upload to db
    Meteor.clearTimeout(typingTimer);

    // avoids invisible character when contenteditable gets empty in touch
    const divHTML = $('#titleContent').html();
    const checkEmpty = divHTML.replace(' ', '').replace('<br>', '');
    if (checkEmpty.length === 0) { content = ''; }
    if (rules.TITLE_MAX_LENGTH !== 0) {
      Session.set('availableChars', parseInt(rules.TITLE_MAX_LENGTH - content.length, 10));
    }

    if (Session.get('firstEditorLoad') && !Meteor.Device.isPhone()) {
      const newTitle = content.replace(TAPi18n.__('no-title'), '');
      document.getElementById('titleContent').innerText = newTitle;
      placeCaretAtEnd(document.getElementById('titleContent'));
      Session.set('firstEditorLoad', false);
    }

    _saveToDraft(content);
  },
  'blur #titleContent'() {
    const content = document.getElementById('titleContent').innerText;
    if (content === '' || content === ' ') {
      Session.set('missingTitle', true);
    }
  },
  'paste #titleContent'(event) {
    const paste = (event.clipboardData || window.clipboardData || event.originalEvent.clipboardData).getData('text');
    const caret = getCaretPosition();
    document.getElementById('titleContent').innerText = document.getElementById('titleContent').innerText.substring(0, caret) + paste + document.getElementById('titleContent').innerText.substring(caret);
    const newCaret = parseInt(caret + (paste.length + 1), 10);
    _saveToDraft(document.getElementById('titleContent').innerText);
  },
});
