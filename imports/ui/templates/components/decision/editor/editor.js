import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { timers } from '/lib/const';

import { Contracts } from '/imports/api/contracts/Contracts';

import './editor.html';
import './editorButton.js';
import './counter.js';

const _keepKeyboard = () => {
  $('#toolbar-hidden-keyboard').focus();
};

function toggle(key, value) {
  const obj = {};
  obj[key] = value;
  Contracts.update(Session.get('contract')._id, { $set: obj });
}

Template.editor.onRendered(() => {
  Session.set('newPostEditor', true);

  // smoke and mirrors
  $('#post-editor-topbar').css('opacity', 0);
  $('#post-editor').css('margin-top', `${$(window).height()}px`);
  $('#post-editor').css('display', '');
  $('#post-editor').velocity({ 'margin-top': '60px' }, {
    duration: timers.ANIMATION_DURATION,
    complete: () => {
      $('#titleContent').focus();
    },
  });
});

Template.editor.helpers({
  log() {
    return Session.get('mobileLog');
  },
  ballotEnabled() {
    return Session.get('contract').ballotEnabled;
  },
  menu() {
    return [
      {
        icon: 'editor-ballot',
        status: () => {
          if (Session.get('contract').ballotEnabled) {
            return 'active';
          }
          return 'enabled';
        },
        action: () => {
          toggle('ballotEnabled', !Session.get('contract').ballotEnabled);
        },
      },
    ];
  },
});

Template.editor.events({
  'click #close-mobile-editor'() {
    $('#post-editor').css('display', '');
    $('#post-editor').velocity({ 'margin-top': `${$(window).height()}px` }, {
      duration: timers.ANIMATION_DURATION,
      complete: () => {
        $('#post-editor').css('display', 'none');
        Session.set('newPostEditor', false);
        window.history.back();
      },
    });
  },
  'click .mobile-section'() {
    $('#titleContent').focus();
  },
});

export const keepKeyboard = _keepKeyboard;
