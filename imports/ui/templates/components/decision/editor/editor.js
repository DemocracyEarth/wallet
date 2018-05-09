import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { ReactiveVar } from 'meteor/reactive-var';

import { timers } from '/lib/const';
import { Contracts } from '/imports/api/contracts/Contracts';
import { timeCompressed } from '/imports/ui/modules/chronos';

import '/imports/ui/templates/components/decision/editor/editor.html';
import '/imports/ui/templates/components/decision/editor/editorButton.js';
import '/imports/ui/templates/components/decision/editor/counter.js';

const _keepKeyboard = () => {
  $('#toolbar-hidden-keyboard').focus();
};

function toggle(key, value) {
  const contract = Session.get('draftContract');
  contract[key] = value;
  Session.set('draftContract', contract);

/*  const obj = {};
  obj[key] = value;
  Contracts.update({ _id: id }, { $set: obj });
  Session.set('draftContract', Contracts.findOne({ _id: id }));
*/
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
      $('#non-editable-debate-header').velocity({ opacity: 0 });
      $('#non-editable-reply-feed').velocity({ opacity: 0 });
      $('#non-editable-vote-feed').velocity({ opacity: 0 });
      $('#non-editable-feed').velocity({ opacity: 0 }, {
        complete: () => {
          $('#non-editable-feed').css({
            overflow: 'hidden',
            height: 0,
          });
          $('.cast').css('height', 0);
          $('#feed-bottom').css('width', 0);
          $('#non-editable-debate-header').css({ height: 0, overflow: 'hidden', marginBottom: '-10px', marginTop: '-10px', paddingTop: '0px' });
          $('#non-editable-reply-feed').css({ height: 0, overflow: 'hidden' });
          $('#non-editable-vote-feed').css({ height: 0, overflow: 'hidden' });
          $('#titleContent').focus();
        },
      });
    } else {
      $('#non-editable-debate-header').velocity({ opacity: 1 });
      $('#non-editable-reply-feed').velocity({ opacity: 1 });
      $('#non-editable-vote-feed').velocity({ opacity: 1 });
      $('#non-editable-feed').velocity({
        opacity: 1,
      }, {
        complete: () => {
          $('.cast').css('height', '60px');
          $('#feed-bottom').css('width', '');
          $('.cast').velocity({ opacity: 1 });
          $('#feed-bottom').velocity({ opacity: 0.3 });
          $('#non-editable-debate-header').css({ height: '', overflow: '', marginBottom: '20px', marginTop: '0px', paddingTop: '3px' });
          $('#non-editable-reply-feed').css({ height: '', overflow: '' });
          $('#non-editable-vote-feed').css({ height: '', overflow: '' });
          $('#non-editable-feed').css({
            height: '',
            overflow: '',
          });
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
  const tag = $('#postEditorItem');
  const diff = parseInt((tag.offset().top + $('.right').scrollTop()) - 80, 10);

  if ($('.right').scrollTop() === 0 && !$('#non-editable-vote-feed').offset()) {
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
  } else {
    $('.right').animate({ scrollTop: diff }, {
      complete: () => {
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
  const contract = Session.get('draftContract');
  Template.instance().ready = new ReactiveVar(true);
  Template.instance().contract = new ReactiveVar(contract);

  if (this.data.replyMode) {
    Template.instance().reply = new ReactiveVar(Contracts.findOne({ _id: this.data.replyId }));
    contract.ballotEnabled = false;
    Session.set('draftContract', contract);
  }
});

Template.editor.onRendered(function () {
  _editorFadeIn(this.data.contractId);
});

Template.editor.helpers({
  log() {
    return Session.get('mobileLog');
  },
  sinceDate() {
    if (Session.get('draftContract')) {
      return `${timeCompressed(Session.get('draftContract').timestamp)}`;
    }
    return '';
  },
  replyTitle() {
    const reply = Template.instance().reply.get();
    if (reply) {
      return `"${reply.title.substring(0, 21)}..."`;
    }
    return '';
  },
  replyURL() {
    const reply = Template.instance().reply.get();
    if (reply) {
      return reply.url;
    }
    return '#';
  },
  ballotEnabled() {
    if (Session.get('draftContract')) {
      return Session.get('draftContract').ballotEnabled;
    }
    return false;
  },
  signatures() {
    if (Session.get('draftContract')) {
      return Session.get('draftContract').signatures;
    }
    return [];
  },
  draftContract() {
    if (Session.get('draftContract')) {
      return Session.get('draftContract');
    }
    return undefined;
  },
  menu() {
    return [
      {
        icon: 'editor-ballot',
        status: () => {
          if (Session.get('draftContract')) {
            if (Session.get('draftContract').ballotEnabled) {
              return 'active';
            }
          }
          return 'enabled';
        },
        action: () => {
          if (Session.get('draftContract')) {
            toggle('ballotEnabled', !Session.get('draftContract').ballotEnabled);
          }
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
