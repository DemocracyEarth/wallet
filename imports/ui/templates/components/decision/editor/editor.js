import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { timers } from '/lib/const';

import { Contracts } from '/imports/api/contracts/Contracts';
import { timeSince } from '/imports/ui/modules/chronos';

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
Template.editor.onRendered(function () {
  @NOTE deprecated animation favoring integrated desktop and mobile UX
  if (!this.data.stage === 'DRAFT') {
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
  }
});
*/

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
            // overflow: 'hidden',
            height: 0,
          });
        },
      });
    } else {
      $('#non-editable-feed').css({
        height: 'auto',
        // overflow: 'none',
      });
      $('#non-editable-feed').velocity({
        opacity: 1,
      }, {
        complete: () => {
          $('.cast').velocity({ opacity: 1 });
          $('#feed-bottom').velocity({ opacity: 0.3 });
        },
      });
    }
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
    if (Meteor.Device.isPhone()) {
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
  }
};

const _editorFadeOut = (contractId) => {
  $(`#feedItem-${contractId}`).velocity({
    opacity: 0,
  }, {
    complete: () => {
      Session.set('showPostEditor', false);
      delete Session.keys.draftContract;
      toggleFeed(true);
    },
  });
};

Template.editor.onRendered(function () {
  _editorFadeIn(this.data.contractId);
});

Template.editor.helpers({
  log() {
    return Session.get('mobileLog');
  },
  /*
  @NOTE: deprecating differentiated editor for device type
  feedMode() {
    return Session.get('showPostEditor');
  },
  */
  sinceDate() {
    return `${timeSince(Contracts.findOne({ _id: this.contractId }).timestamp)}`;
  },
  ballotEnabled() {
    return Contracts.findOne({ _id: this.contractId }).ballotEnabled; // Session.get('contract').ballotEnabled;
  },
  signatures() {
    return Contracts.findOne({ _id: this.contractId }).signatures;
  },
  menu() {
    return [
      {
        icon: 'editor-ballot',
        status: () => {
          if (Contracts.findOne({ _id: this.contractId }).ballotEnabled) { // Session.get('contract').ballotEnabled) {
            return 'active';
          }
          return 'enabled';
        },
        action: () => {
          toggle('ballotEnabled', !Contracts.findOne({ _id: this.contractId }).ballotEnabled, this.contractId); // !Session.get('contract').ballotEnabled);
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
