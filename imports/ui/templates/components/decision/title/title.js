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

import './title.html';
import '../stage/stage.js';
import '../../../widgets/warning/warning.js';

let typingTimer; // timer identifier

Template.title.rendered = function rendered() {
  initEditor();

  //TODO: figure out how to make tab work properly on first try.

  //tab focus next object
  $('#ideaTitle').on('focus', function(e){
    $(window).keyup(function (e) {
      const code = (e.keyCode ? e.keyCode : e.which);
      if (code === 9) {
        $('#ideaDescription').focus();
      }
    });
  });

  // paste
  document.getElementById('ideaTitle').addEventListener('paste', function (e) {
    e.preventDefault();
    const text = stripHTMLfromText(e.clipboardData.getData('text/plain'));
    const newtitle = $('#ideaTitle')[0].innerText;
    const delta = parseInt(rules.TITLE_MAX_LENGTH - newtitle.length);
    if (delta > 0) {
      document.execCommand('insertHTML', false, text);
    }
  });

};

Template.titleContent.helpers({
  sampleMode() {
    if (Session.get('missingTitle')) {
      return 'sample';
    }
    return '';
  },
  declaration() {
    return getTitle();
  },
  editable() {
    return `<div id='ideaTitle' contenteditable='true' tabindex=0> ${this.toString()} </div>`;
  },
});

// Title of Contract
Template.title.helpers({
  blockchainAddress() {
    return '';
  },
  declaration() {
    return getTitle();
  },
  contractURL() {
    var host =  window.location.host;
    var keyword = '';

    if (Session.get('contract')) {
      if (Session.get('contractKeyword') == undefined) {
        Session.set('contractKeyword', Session.get('contract').keyword);
      } else if (Session.get('contractKeyword') != Session.get('contract').keyword) {
        keyword = Session.get('contractKeyword');
      } else {
        keyword = Session.get('contract').keyword;
      }
      return `${host}/${Session.get('contract').kind.toLowerCase()}/<strong>${keyword}</strong>`;
    }
  },
  missingTitle() {
    if (Session.get('missingTitle')) {
      Session.set('URLStatus', 'UNAVAILABLE');
    }
    if ($('#ideaTitle').is(":focus")) {
      Session.set('URLStatus', 'NONE');
    }
    if (!Session.get('firstEditorLoad')) {
      return Session.get('missingTitle');
    }
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
      let d = new Date;
      if (Session.get('contract').timestamp != undefined) {
        d = Session.get('contract').timestamp;
        return d.format('{Month} {d}, {yyyy}');
      }
    }
  },
  executionStatus() {
    if (Session.get('contract') != undefined) {
      return Session.get('contract').executionStatus;
    }
  },
  stageLabel() {
    if (Session.get('contract') != undefined) {
      return Session.get('contract').stage;
    }
  },
  closingDate() {
    if (Session.get('contract') != undefined) {
      return Session.get('contract').closingDate;
    }
  }
});


Template.titleContent.events({
  'input #ideaTitle'(event) {
    const content = document.getElementById('ideaTitle').innerText;// jQuery($("#ideaTitle").html()).text();
    const keyword = convertToSlug(content);
    const contract = Contracts.findOne({ keyword: keyword });

    // Set timer to check upload to db
    Meteor.clearTimeout(typingTimer);
    Session.set('contractKeyword', keyword);
    Session.set('URLStatus', 'VERIFY');

    if (Session.get('firstEditorLoad')) {
      const currentTitle = document.getElementById('ideaTitle').innerText;
      const newTitle = currentTitle.replace(TAPi18n.__('no-title'), '');
      document.getElementById('ideaTitle').innerText = newTitle;
      placeCaretAtEnd(document.getElementById('ideaTitle'));
      Session.set('firstEditorLoad', false);
    }

    // Checking content typed
    if (content === '') {
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
      if (contract !== undefined && contract._id !== Session.get('contract')._id) {
          Session.set('URLStatus', 'UNAVAILABLE');
      } else {
        const url = "/" + Session.get('contract').kind.toLowerCase() + "/" + keyword
        if (Contracts.update({ _id: Session.get('contract')._id }, { $set: { title: content, keyword, url } })) {
          Session.set('URLStatus', 'AVAILABLE');
        }
        displayNotice(TAPi18n.__('saved-draft-description'), true);
      }
    }, timers.SERVER_INTERVAL);
  },
  'keypress #ideaTitle'(event) {
    const content = document.getElementById('ideaTitle').innerText;
    return (content.length <= rules.TITLE_MAX_LENGTH) && event.which !== 13 && event.which !== 9;
  },
  'focus #ideaTitle'(event) {
    if (Session.get('missingTitle')) {
      document.getElementById('ideaTitle').innerText = '';
      Session.set('missingTitle', false);
    }
  },
  'blur #ideaTitle'(event) {
    const content = document.getElementById('ideaTitle').innerText;
    if (content === '' || content === ' ') {
      Session.set('missingTitle', true);
      document.getElementById('ideaTitle').innerText = TAPi18n.__('no-title');
    }
  }
});

//returns the title from the contract
function getTitle() {
  // FIX missed contractId
  const contract = Contracts.findOne({ _id: contractId }, { reactive: false });
  if (!contract) {
    return;
  }
  const title = contract.title;
  if (title === '' || title === undefined) {
    Session.set('missingTitle', true);
    return TAPi18n.__('no-title');
  } else {
    Session.set('missingTitle', false);
    return title;
  }
}
