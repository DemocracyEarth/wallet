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
* @summary converts string text using markdown signals to HTML
* @param {string} text
*/
const parseMarkup = (text) => {
  // hashtags
  const html = text.replace(/(^|\s)(#[a-z\d][\w-]*)/ig, `$1<a href='/tag/$2'>$2</a>`).replace("href='/tag/#", "href='/tag/");
  return html;
};

function displayTitle(title) {
  if (title === '' || title === undefined) {
    Session.set('missingTitle', true);
    return ' ';
  }
  Session.set('missingTitle', false);
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
      if (delta > 0) {
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
    const draft = Session.get('draftContract');

    // Set timer to check upload to db
    Meteor.clearTimeout(typingTimer);

    // avoids invisible character when contenteditable gets empty in touch
    const divHTML = $('#titleContent').html();
    const checkEmpty = divHTML.replace(' ', '').replace('<br>', '');
    if (checkEmpty.length === 0) { content = ''; }
    Session.set('availableChars', parseInt(rules.TITLE_MAX_LENGTH - content.length, 10));

    if (Session.get('firstEditorLoad') && !Meteor.Device.isPhone()) {
      const newTitle = content.replace(TAPi18n.__('no-title'), '');
      document.getElementById('titleContent').innerText = newTitle;
      placeCaretAtEnd(document.getElementById('titleContent'));
      Session.set('firstEditorLoad', false);
    }

    // Checking content typed
    if (content === '') {
      Session.set('missingTitle', true);
      return;
    }
    Session.set('missingTitle', false);

    // call function when typing seems to be finished.
    typingTimer = Meteor.setTimeout(() => {
      Session.set('draftContract', Object.assign(draft, { title: parseMarkup(content) }));
    }, timers.SERVER_INTERVAL);
  },
  'blur #titleContent'() {
    const content = document.getElementById('titleContent').innerText;
    if (content === '' || content === ' ') {
      Session.set('missingTitle', true);
    }
  },
});
