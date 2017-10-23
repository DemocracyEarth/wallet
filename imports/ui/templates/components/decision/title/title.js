import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { Contracts } from '/imports/api/contracts/Contracts';
import { rules, timers } from '/lib/const';
import { convertToSlug } from '/lib/utils';
import { placeCaretAtEnd } from '/imports/startup/both/modules/utils';
import { initEditor } from '/imports/ui/modules/editor';
import { stripHTMLfromText } from '/imports/ui/modules/utils';
import { URLCheck, URLVerifier } from '/imports/ui/modules/Files';
import { displayNotice } from '/imports/ui/modules/notice';
import { shortUUID } from '/imports/startup/both/modules/crypto';

import './title.html';
import '../stage/stage.js';
import '../../../widgets/warning/warning.js';

let typingTimer; // timer identifier

/**
* @summary dynamically generates a valid URL keyword regardless the case
* @param {string} keyword tentative title being used for contract
*/
function setCustomURL(keyword, contractId) {
  let dynamicURL;
  let contract = Contracts.findOne({ _id: contractId });

  while (contract) {
    if (keyword.length < 3) { // Meteor.Device.isPhone() &&
      dynamicURL = convertToSlug(`${keyword}-${shortUUID()}`);
    } else if (!dynamicURL) {
      dynamicURL = convertToSlug(keyword);
    }
    contract = Contracts.findOne({ keyword: dynamicURL });
    if (contract) {
      if (contract._id !== contractId) {
        dynamicURL = convertToSlug(`${keyword}-${shortUUID()}`);
        contract = undefined;
      } else if (contract._id === contractId) {
        contract = undefined;
      }
    }
  }
  return dynamicURL;
}

function displayTitle(title) {
  if (title === '' || title === undefined) {
    Session.set('missingTitle', true);
    return ' ';
  }
  Session.set('missingTitle', false);
  return title;
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
    let html;
    let viewportHeight;
    viewportHeight = 300;
    html = `<div id='titleContent' contenteditable='true' style='min-height: ${viewportHeight}px' tabindex=0> ${this.toString()} </div>`;
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
  blockchainAddress() {
    return '';
  },
  declaration() {
    return displayTitle(this.title);
  },
  contractURL() {
    const host = window.location.host;
    let keyword = '';

    if (Contracts.findOne({ _id: this.contractId })) {
      if (Session.get('contractKeyword') === undefined) {
        Session.set('contractKeyword', Contracts.findOne({ _id: this.contractId }).keyword);
      } else if (Session.get('contractKeyword') !== Contracts.findOne({ _id: this.contractId }).keyword) {
        keyword = Session.get('contractKeyword');
      } else {
        keyword = Contracts.findOne({ _id: this.contractId }).keyword;
      }
      return `${host}/${Contracts.findOne({ _id: this.contractId }).kind.toLowerCase()}/<strong>${keyword}</strong>`;
    }
  },
  missingTitle() {
    return Session.get('missingTitle');
  },
  mistypedTitle() {
    return Session.get('mistypedTitle');
  },
  URLStatus() {
    return URLCheck('URLStatus');
  },
  verifierMode() {
    return URLVerifier('URLStatus');
  },
  duplicateURL() {
    return Session.get('duplicateURL');
  },
});

Template.title.events({
  'click #emptyTitle'() {
    $('#titleContent').focus();
  },
});

Template.titleContent.events({
  'input #titleContent'(event, instance) {
    let content = document.getElementById('titleContent').innerText;
    const keyword = setCustomURL(content, instance.data.contractId);
    const draft = Session.get('draftContract');

    // Set timer to check upload to db
    Meteor.clearTimeout(typingTimer);
    Session.set('contractKeyword', keyword);
    Session.set('URLStatus', 'VERIFY');

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
      Session.set('contractKeyword', keyword);
      Session.set('URLStatus', 'UNAVAILABLE');
      Session.set('missingTitle', true);
      return;
    }
    Session.set('missingTitle', false);
    Session.set('mistypedTitle', false);


    // call function when typing seems to be finished.
    typingTimer = Meteor.setTimeout(() => {
      const url = `/vote/${keyword}`;
      const changes = {
        title: content,
        keyword,
        url,
      };
      Session.set('draftContract', Object.assign(draft, changes));
    }, timers.SERVER_INTERVAL);
  },
  'blur #titleContent'() {
    const content = document.getElementById('titleContent').innerText;
    if (content === '' || content === ' ') {
      Session.set('missingTitle', true);
    }
  },
});
