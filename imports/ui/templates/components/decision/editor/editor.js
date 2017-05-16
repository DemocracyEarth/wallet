import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { timers } from '/lib/const';

import './editor.html';

Template.editor.onRendered(() => {
  Session.set('displayToolbar', true);

  // hack to get virtual keyboard height in any mobile device without native access
  $(document.body).on('focus', '#titleContent', () => {
    setTimeout(() => {
      window.scrollTo(0, $('#mobileToolbar').offset().top - 100);
      setTimeout(() => {
        $('#post-editor').css('top', `${$(window).scrollTop()}px`);
        $('#post-editor-content').velocity({ opacity: 1 }, { duration: 50 });
      }, 150);
    }, 0);
  });

  // smoke and mirrors
  $('#post-editor-content').css('opacity', 0);
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
});
