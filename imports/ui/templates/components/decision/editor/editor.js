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

  document.getElementById('post-editor-wrapper').addEventListener('touchmove', (e) => {
    // e.preventDefault();
    // $('#titleContent').focus();
  }, false);

  document.getElementById('titleContent').addEventListener('click', (e) => {
    console.log('hey');
  });

  $('.scrollFix').css("pointer-events","none");

  $('body').on('touchstart', function(e) {
      $('.scrollFix').css("pointer-events","auto");
  });
  $('body').on('touchmove', function(e) {
      $('.scrollFix').css("pointer-events","none");
  });
  $('body').on('touchend', function(e) {
      setTimeout(function() {
          $('.scrollFix').css("pointer-events", "none");
      },0);
  });


  Session.set('mobileEditorScrollTop', 0);

  // hack to get virtual keyboard height in any mobile device without native access
  $(document.body).on('focus', '#titleContent', (event) => {
    if (Session.get('mobileEditorScrollTop') === 0) {
      event.preventDefault();
      setTimeout(() => {
        window.scrollTo(0, $('#mobileToolbar').offset().top);
        setTimeout(() => {
          $('#post-editor').css('top', `${$(window).scrollTop()}px`);
          if ($('#post-editor-topbar').css('opacity') === '0') {
            $('#post-editor-topbar').velocity({ opacity: 1 }, { duration: 160 });
          }
          Session.set('mobileEditorScrollTop', $(window).scrollTop());
        }, 150);
      }, 0);
    } else {
      event.preventDefault();
      setTimeout(() => {
        window.scrollTo(0, $('#mobileToolbar').offset().top);
        setTimeout(() => {
          $('#post-editor').css('top', `${$(window).scrollTop()}px`);
          Session.set('mobileEditorScrollTop', $(window).scrollTop());
        }, 150);
      }, 0);
    }
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
