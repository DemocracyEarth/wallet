import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';

import { stripHTMLfromText } from '/imports/ui/modules/utils';
import { timers } from '/lib/const';
import { Contracts } from '/imports/api/contracts/Contracts';
import { timeCompressed } from '/imports/ui/modules/chronos';

import '/imports/ui/templates/components/decision/editor/editor.html';
import '/imports/ui/templates/components/decision/editor/editorButton.js';
import '/imports/ui/templates/components/decision/editor/counter.js';
import '/imports/ui/templates/components/decision/constituency/constituency.js';
import '/imports/ui/templates/components/decision/electorate/electorate.js';

const _keepKeyboard = () => {
  $('#toolbar-hidden-keyboard').focus();
};

const _resetDraft = (contract) => {
  const draft = contract;
  draft.constituencyEnabled = false;
  draft.ballotEnabled = false;
  draft.stakingEnabled = false;
  return draft;
};

const _toggle = (key, value) => {
  const contract = Session.get('draftContract');
  contract[key] = value;
  Session.set('draftContract', contract);
};

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
      // $('#non-editable-reply-feed').velocity({ opacity: 0 });
      $('#non-editable-vote-feed').velocity({ opacity: 0 });
      $('#non-editable-feed').velocity({ opacity: 0 }, {
        complete: () => {
          $('#non-editable-feed').css({
            overflow: 'hidden',
            height: 0,
          });
          console.log('path C');
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
    console.log('path A')
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
    console.log('path B')
    $('.right').animate({ scrollTop: diff }, {
      complete: () => {
        toggleFeed(false);
      },
    });
  }
};

const _editorFadeOut = () => {
  if (Meteor.Device.isPhone()) {
    Session.set('showPostEditor', false);
    delete Session.keys.draftContract;
    toggleFeed(true);
  }
};

const _threadEditor = (instance) => {
  if (instance.data.mainFeed) {
    const previous = Contracts.findOne({ _id: instance.data.replyId });
    $('#feedItem-editor').wrapAll(`<div id='thread-editor' class='vote-thread ${previous.replyId ? 'vote-thread-main' : ''} ' />`);
    $('#thread-editor').prepend("<div class='thread-sub'><div class='thread-needle thread-last'></div>");
  } else {
    $(`#feedItem-editor`).wrapAll(`<div id='thread-editor' class='vote-thread' />`);
    $(`#thread-${instance.data._id}`).prepend(`<div class='thread-sub'><div class='thread-needle ${instance.data.lastItem ? 'thread-last' : ''}'></div></div>`);
    if (instance.data.depth > 1) {
      for (let i = 1; i < instance.data.depth; i += 1) {
        $(`#thread-${instance.data._id}`).wrapAll(`<div id='thread-${instance.data._id}-depth-${i}' class='vote-thread' />`);
      }
    }
  }
};

Template.editor.onCreated(function () {
  const contract = Session.get('draftContract');
  Template.instance().ready = new ReactiveVar(true);
  Template.instance().contract = new ReactiveVar(contract);
  Template.instance().reply = new ReactiveVar();
});

Template.editor.onDestroyed(() => {
  $('#thread-editor').remove();
});

Template.editor.onRendered(function () {
  if (!this.data.compressed) {
    const draft = _resetDraft(Session.get('draftContract'));
    if (Template.currentData().replyMode && Template.currentData().replyId) {
      Template.instance().reply.set(Contracts.findOne({ _id: this.data.replyId }));
      draft.replyId = Template.currentData().replyId;
      _threadEditor(this);
    } else {
      draft.replyId = '';
    }
    Session.set('draftContract', draft);
    toggleFeed(false);

    window.addEventListener('click', function (e) {
      if (document.getElementById('feedItem-editor') && !document.getElementById('feedItem-editor').contains(e.target)) {
        console.log('eh');
        const reset = _resetDraft(Session.get('draftContract'));
        reset.replyId = '';
        console.log(reset);
        // Session.set('draftContract', reset);
      }
    });
  }
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
      return `"${stripHTMLfromText(reply.title).substring(0, 30)}..."`;
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
  stakingEnabled() {
    if (Session.get('draftContract')) {
      return Session.get('draftContract').stakingEnabled;
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
        label: TAPi18n.__('ballot'),
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
            _toggle('ballotEnabled', !Session.get('draftContract').ballotEnabled);
          }
        },
      },
      {
        icon: 'editor-stake',
        label: TAPi18n.__('staking'),
        status: () => {
          if (Session.get('draftContract')) {
            if (Session.get('draftContract').stakingEnabled) {
              return 'active';
            }
          }
          return 'enabled';
        },
        action: () => {
          if (Session.get('draftContract')) {
            _toggle('stakingEnabled', !Session.get('draftContract').stakingEnabled);
          }
        },
      },
      /* {
        icon: 'editor-constituency',
        label: TAPi18n.__('constituency'),
        status: () => {
          if (Session.get('draftContract')) {
            if (Session.get('draftContract').constituencyEnabled) {
              return 'active';
            }
          }
          return 'enabled';
        },
        action: () => {
          if (Session.get('draftContract')) {
            toggle('constituencyEnabled', !Session.get('draftContract').constituencyEnabled);
            displayPopup($('.section-editor')[0], 'constituency', Meteor.userId(), 'click', 'constituency-popup');
          }
        },
      },*/
    ];
  },
});

Template.editor.events({
  'click #feedItem-compressed'() {
    const draft = _resetDraft(Session.get('draftContract'));
    draft.replyId = '';
    Session.set('draftContract', draft);
  },
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

export const toggle = _toggle;
export const keepKeyboard = _keepKeyboard;
export const editorFadeOut = _editorFadeOut;
export const editorFadeIn = _editorFadeIn;
