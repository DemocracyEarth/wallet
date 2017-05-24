import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { timers } from '/lib/const';

import './editor.html';

Template.editor.onRendered(() => {
  Session.set('displayToolbar', true);

  document.getElementById('post-editor-topbar').addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, false);

 /* document.getElementById('post-editor').addEventListener('touchmove', (e) => {
    console.log(e.target);
    e.preventDefault();
  }, false);*/

  // $('body').on('touchmove', (e) => { e.preventDefault(); });
  /*$('body').on('touchmove', (e) => {
    //if (!$('.mobile-section').has($(e.target)).length) {
      e.preventDefault();
      Session.set('mobileLog', e.target);
    //}
  });*/

  /*$(document).on('touchmove', (e) => {
    if (!$('#post-editor-wrapper').has($(e.target)).length) {
      e.preventDefault();
    }
  });*/

  $('#post-editor-wrapper').on('touchmove scroll', (e) => {
    Session.set('mobileLog', e.type);
    if (e.type === 'touchmove') {
      e.preventDefault();
    }
  });

  // $(document).on('touchmove', '#post-editor-wrapper', (e) => { e.stopPropagation(); });

  // hack to get virtual keyboard height in any mobile device without native access
  $(document.body).on('focus', '#titleContent', (event) => {
    // Session.set('mobileLog', `${$('#post-editor').css('top')} & ${$(window).scrollTop()}px`);
    event.preventDefault();
    setTimeout(() => {
      window.scrollTo(0, $('#mobileToolbar').offset().top);
      setTimeout(() => {
        $('#post-editor').css('top', `${$(window).scrollTop()}px`);
        if ($('#post-editor-topbar').css('opacity') === '0') {
          $('#post-editor-topbar').velocity({ opacity: 1 }, { duration: 160 });
        }
      }, 150);
    }, 0);
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
  'click .mobile-editor-wrapper'() {
    $('#titleContent').focus();
  },
});
