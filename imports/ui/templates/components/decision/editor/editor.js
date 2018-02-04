import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { ReactiveVar } from 'meteor/reactive-var';

import { timers } from '/lib/const';
import { Contracts } from '/imports/api/contracts/Contracts';
import { timeCompressed } from '/imports/ui/modules/chronos';

import './editor.html';
import './editorButton.js';
import './counter.js';

const _keepKeyboard = () => {
  $('#toolbar-hidden-keyboard').focus();
};

function toggle(key, value, id) {
  const obj = {};
  obj[key] = value;
  Contracts.update({ _id: id }, { $set: obj });
}

/**
* @summary enables or disables feed and disables scrolling in mobile devices
* @param {boolean} enabled show feed
*/
function toggleFeed(enabled) {
  if (Meteor.Device.isPhone()) {
    if (!enabled) {
      $('.cast').velocity({ opacity: 0 });
      $('#feed-bottom').velocity({ opacity: 0 });
      $('#non-editable-feed').velocity({ opacity: 0 }, {
        complete: () => {
          $('#non-editable-feed').css({
            overflow: 'hidden',
            height: 0,
          });
          $('.cast').css('height', 0);
          $('#feed-bottom').css('width', 0);
          $('#titleContent').focus();
        },
      });
    } else {
      $('#non-editable-feed').css({
        height: 'auto',
        overflow: 'inherit',
      });
      $('#non-editable-feed').velocity({
        opacity: 1,
      }, {
        complete: () => {
          $('.cast').css('height', '60px');
          $('#feed-bottom').css('width', 'auto');
          $('.cast').velocity({ opacity: 1 });
          $('#feed-bottom').velocity({ opacity: 0.3 });
        },
      });
    }
  } else {
    $('#titleContent').focus();
  }
}

/**
* @summary animation intro of editorMode
* @param {string} contractId contract being edited to grab div
*/
const _editorFadeIn = (contractId) => {
  const originalHeight = $(`#feedItem-${contractId}`)[0].getBoundingClientRect().height;
  if ($('.right').scrollTop() > 0) {
    $('.right').animate({ scrollTop: 0 }, {
      complete: () => {
        toggleFeed(false);
      },
    });
  } else {
    $(`#feedItem-${contractId}`).css({
      overflow: 'hidden',
      height: 0,
      marginLeft: $('.right').width(),
    });
    $(`#feedItem-${contractId}`).velocity({
      height: originalHeight,
      marginLeft: 0,
    }, {
      complete: () => {
        $(`#feedItem-${contractId}`).css({
          height: 'auto',
          overflow: 'none',
        });
        toggleFeed(false);
      },
    });
  }
};

const _editorFadeOut = (contractId) => {
  $(`#feedItem-${contractId}`).velocity({
    opacity: 0,
    height: 0,
  }, {
    complete: () => {
      Session.set('showPostEditor', false);
      delete Session.keys.draftContract;
      toggleFeed(true);
    },
  });
};

Template.editor.onCreated(function () {
  Template.instance().ready = new ReactiveVar(false);
  Template.instance().contract = new ReactiveVar();
  const instance = this;
  instance.autorun(function () {
  /*  const subscription = instance.subscribe('singleContract', { view: 'contract', contractId: instance.data.contractId });
    if (subscription.ready()) {
      instance.ready.set(true);
    }
    */
    instance.contract.set(Session.get('draftContract'));
    instance.ready.set(true);
  });
});

Template.editor.onRendered(function () {
  _editorFadeIn(this.data.contractId);
});

Template.editor.helpers({
  log() {
    return Session.get('mobileLog');
  },
  sinceDate() {
    if (Template.instance().ready.get()) {
      return `${timeCompressed(Template.instance().contract.get().timestamp)}`;
    }
    return '';
  },
  ballotEnabled() {
    if (Template.instance().ready.get()) {
      return Template.instance().contract.get().ballotEnabled;
    }
    return false;
  },
  signatures() {
    if (Template.instance().ready.get()) {
      return Template.instance().contract.get().signatures;
    }
    return [];
  },
  draftContract() {
    if (Template.instance().ready.get()) {
      return Template.instance().contract.get();
    }
    return undefined;
  },
  menu() {
    return [
      {
        icon: 'editor-ballot',
        status: () => {
          if (Contracts.findOne({ _id: this.contractId }).ballotEnabled) {
            return 'active';
          }
          return 'enabled';
        },
        action: () => {
          toggle('ballotEnabled', !Contracts.findOne({ _id: this.contractId }).ballotEnabled, this.contractId);
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
        Session.set('showPostEditor', false);
        window.history.back();
      },
    });
  },
  'click .mobile-section'() {
    $('#titleContent').focus();
  },
});

export const keepKeyboard = _keepKeyboard;
export const editorFadeOut = _editorFadeOut;
export const editorFadeIn = _editorFadeIn;
