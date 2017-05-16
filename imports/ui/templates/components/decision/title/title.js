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
function setCustomURL(keyword) {
  let dynamicURL;
  let contract = Session.get('contract');

  while (contract) {
    if (Meteor.Device.isPhone() && (keyword.length < 3)) {
      dynamicURL = convertToSlug(`${keyword}-${shortUUID()}`);
    } else if (!dynamicURL) {
      dynamicURL = convertToSlug(keyword);
    }
    contract = Contracts.findOne({ keyword: dynamicURL });
    if (contract) {
      if (contract._id !== Session.get('contract')._id) {
        dynamicURL = convertToSlug(`${keyword}-${shortUUID()}`);
        contract = undefined;
      } else if (contract._id === Session.get('contract')._id) {
        contract = undefined;
      }
    }
  }
  return dynamicURL;
}

function displayTitle(title) {
  if (title === '' || title === undefined) {
    Session.set('missingTitle', true);
    if (Meteor.Device.isPhone()) {
      return ' ';
    }
    return TAPi18n.__('no-title');
  }
  Session.set('missingTitle', false);
  return title;
}

// returns the title from the contract
function getTitle(voice) {
  if (Meteor.Device.isPhone() && voice.editorMode) {
    return displayTitle('');
  }

  // TODO: Fix this fucking incredibly lame global shit of contractId somehow.
  const contract = Contracts.findOne({ _id: contractId }, { reactive: false });

  if (!contract) {
    return '';
  }
  return displayTitle(contract.title);
}

Template.title.onRendered(() => {
  initEditor();

  // TODO: figure out how to make tab work properly on first try.

  // tab focus next object
  $('#titleContent').on('focus', () => {
    $(window).keyup((e) => {
      const code = (e.keyCode ? e.keyCode : e.which);
      if (code === 9) {
        $('#editor').focus();
      }
    });
  });

  // paste
  document.getElementById('titleContent').addEventListener('paste', (e) => {
    e.preventDefault();
    const text = stripHTMLfromText(e.clipboardData.getData('text/plain'));
    const newtitle = $('#titleContent')[0].innerText;
    const delta = parseInt(rules.TITLE_MAX_LENGTH - newtitle.length, 10);
    if (delta > 0) {
      document.execCommand('insertHTML', false, text);
    }
  });
});

Template.titleContent.helpers({
  sampleMode() {
    if (Session.get('missingTitle')) {
      return 'sample';
    }
    return '';
  },
  declaration() {
    return getTitle(this);
  },
  editable() {
    const html = `<div id='titleContent' contenteditable='true' tabindex=0> ${this.toString()} </div>`;
    return html;
  },
});

// Title of Contract
Template.title.helpers({
  blockchainAddress() {
    return '';
  },
  declaration() {
    return getTitle(this);
  },
  contractURL() {
    const host = window.location.host;
    let keyword = '';

    if (Session.get('contract')) {
      if (Session.get('contractKeyword') === undefined) {
        Session.set('contractKeyword', Session.get('contract').keyword);
      } else if (Session.get('contractKeyword') !== Session.get('contract').keyword) {
        keyword = Session.get('contractKeyword');
      } else {
        keyword = Session.get('contract').keyword;
      }
      return `${host}/${Session.get('contract').kind.toLowerCase()}/<strong>${keyword}</strong>`;
    }
  },
  missingTitle() {
    if (!Meteor.Device.isPhone()) {
      if (Session.get('missingTitle')) {
        Session.set('URLStatus', 'UNAVAILABLE');
      }
      if ($('#titleContent').is(':focus')) {
        Session.set('URLStatus', 'NONE');
      }
      if (Session.get('firstEditorLoad')) {
        return false;
      }
    }
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
  timestamp() {
    if (Session.get('contract')) {
      let d = Date();
      if (Session.get('contract').timestamp !== undefined) {
        d = Session.get('contract').timestamp;
        return d.format('{Month} {d}, {yyyy}');
      }
    }
    return '';
  },
});

Template.titleContent.onRendered(() => {
  $('#titleContent').bind('click', (e) => {
    e.preventDefault(); // the important thing I think
    e.stopPropagation();

    $('#titleContent').focus();
  });
});

Template.titleContent.events({
  'input #titleContent'() {
    const content = document.getElementById('titleContent').innerText;
    const keyword = setCustomURL(content);
    const contract = Contracts.findOne({ keyword: keyword });

    // Set timer to check upload to db
    Meteor.clearTimeout(typingTimer);
    Session.set('contractKeyword', keyword);
    Session.set('URLStatus', 'VERIFY');

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
    } else if (keyword.length < 3 && !Meteor.Device.isPhone()) {
      Session.set('contractKeyword', keyword);
      Session.set('URLStatus', 'UNAVAILABLE');
      Session.set('mistypedTitle', true);
      Session.set('missingTitle', false);
      return;
    }
    Session.set('missingTitle', false);
    Session.set('mistypedTitle', false);


    // call function when typing seems to be finished.
    typingTimer = Meteor.setTimeout(() => {
      if (contract !== undefined && contract._id !== Session.get('contract')._id) {
        Session.set('URLStatus', 'UNAVAILABLE');
      } else {
        const url = `/${Session.get('contract').kind.toLowerCase()}/${keyword}`;
        if (Contracts.update({ _id: Session.get('contract')._id }, { $set: { title: content, keyword, url } })) {
          Session.set('URLStatus', 'AVAILABLE');
        }
        displayNotice(TAPi18n.__('saved-draft-description'), true);
      }
    }, timers.SERVER_INTERVAL);
  },
  'keypress #titleContent'(event) {
    const content = document.getElementById('titleContent').innerText;
    return (content.length <= rules.TITLE_MAX_LENGTH) && event.which !== 13 && event.which !== 9;
  },
  'focus #titleContent'() {
    if (!Meteor.Device.isPhone()) {
      if (Session.get('missingTitle')) {
        document.getElementById('titleContent').innerText = '';
        Session.set('missingTitle', false);
      }
    }
  },
  'blur #titleContent'() {
    const content = document.getElementById('titleContent').innerText;
    if (content === '' || content === ' ') {
      Session.set('missingTitle', true);
      if (!Meteor.Device.isPhone()) {
        document.getElementById('titleContent').innerText = TAPi18n.__('no-title');
      }
    }
  },
});
