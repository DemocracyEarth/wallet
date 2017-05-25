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

  document.getElementById('content').addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, false);

  document.getElementById('post-editor-wrapper').addEventListener('touchmove', (e) => {
    //if (e.target.className !== '') {
     // e.stopPropagation();
      e.preventDefault();
    //}
    console.log(e);
    Session.set('mobileLog', e.target.className);
  }, false);

  // document.body.addEventListener('touchmove', function(e){ e.preventDefault(); });

  // hack to get virtual keyboard height in any mobile device without native access
  $(document.body).on('focus', '#titleContent', (event) => {
    // Session.set('mobileLog', `${$('#post-editor').css('top')} & ${$(window).scrollTop()}px`);
    event.preventDefault();
    setTimeout(() => {
      window.scrollTo(0, $('#mobileToolbar').offset().top);
      setTimeout(() => {
        const toolbarDelta = parseInt($(window).scrollTop() + 56, 10);
        // $('#mobileToolbar').css('top', `${toolbarDelta}px`);
        Session.set('mobileLog', toolbarDelta);
        $('#post-editor').css('top', `${$(window).scrollTop()}px`);
        $('#content').css('overflow', 'hidden');
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
