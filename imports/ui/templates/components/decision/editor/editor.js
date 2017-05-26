import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { timers } from '/lib/const';

import './editor.html';

const _keepKeyboard = () => {
  $('#toolbar-hidden-keyboard').focus();
};

Template.editor.onRendered(() => {
  Session.set('displayToolbar', true);

  document.getElementById('post-editor-topbar').addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, false);

  Session.set('editorViewportHeight', 0);

  // hack to get virtual keyboard height in any mobile device without native access
  $(document.body).on('focus', '#titleContent', (event) => {
    if (Session.get('editorViewportHeight') === 0) {
      event.preventDefault();
      setTimeout(() => {
        window.scrollTo(0, $('#mobileToolbar').offset().top);
        setTimeout(() => {
          $('#post-editor').css('top', `${$(window).scrollTop()}px`);
          if ($('#post-editor-topbar').css('opacity') === '0') {
            $('#post-editor-topbar').velocity({ opacity: 1 }, { duration: 160 });
          }
          const viewportH = parseInt($('#post-editor-wrapper').outerHeight(), 10);
          Session.set('editorViewportHeight', viewportH);
          $('#titleContent').css('min-height', `${viewportH}px`);
        }, 150);
      }, 0);
    } else {
      event.preventDefault();
      // $('#titleContent').focusWithoutScrolling();
      // window.scrollTo(0, Session.get('mobileEditorScrollTop'));
      // $(this).select();
    }
  });

  $(document.body).on('blur', '#titleContent', () => {
    _keepKeyboard();
  });

  // smoke and mirrors
  $('#post-editor-topbar').css('opacity', 0);
  $('#post-editor').css('margin-top', `${$(window).height()}px`);
  $('#post-editor').css('display', '');
  $('#post-editor').velocity({ 'margin-top': '0px' }, {
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
  widgetTop() {
    return `${parseInt((Session.get('editorViewportHeight') * -1) + 64, 10)}px`;
  }
});

Template.editor.events({
  'click #close-mobile-editor'() {
    $('#post-editor').css('display', '');
    $('#post-editor').velocity({ 'margin-top': `${$(window).height()}px` }, {
      duration: timers.ANIMATION_DURATION,
      complete: () => {
        $('#post-editor').css('display', 'none');
        Session.set('displayToolbar', false);
        window.history.back();
      },
    });
  },
  'click .mobile-section'() {
    $('#titleContent').focus();
  },
});

export const keepKeyboard = _keepKeyboard;
