import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { animationSettings } from '/imports/ui/modules/animation';
import { modalCallback, displayModal } from '/imports/ui/modules/modal';
import { globalObj } from '/lib/global';

import './modal.html';
import '../../components/identity/avatar/avatar.js';

Template.modal.helpers({
  showModal() {
    return Session.get('showModal');
  }
});


Template.modalWindow.rendered = function rendered() {
  //Initial position
  const paddingTotal = parseInt($('.alert').css('padding-bottom')) + parseInt($('.alert').css('padding-top'));
  let alertHeight = parseInt((window.innerHeight / 2) - (($('.alert').height() + paddingTotal) / 2));
  if (alertHeight > 200) {
    alertHeight = 200;
  }

  //Intro animation
  $('.alert').css('margin-top', alertHeight + 'px');
  $('.modal').css('opacity', '0');
  $('.modal').velocity({ opacity: '1' }, animationSettings);

};

Template.modalWindow.helpers({
  icon() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').icon;
    }
  },
  title() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').title;
    }
  },
  message() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').message;
    }
  },
  cancel() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').cancel;
    }
  },
  action() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').action;
    }
  },
  displayProfile() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').displayProfile;
    }
  },
  profileId() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').profileId;
    }
  },
  visible() {
    if (Session.get('displayModal') !== undefined) {
      if (Session.get('displayModal').visible === true) {
        return '';
      }
    }
    return 'hide';
  }
});

Template.modalWindow.events({
  'click #modalToggle'() {
    // Modules.client.displayModal(false);
  },
  'click #cancel'(event, sessionVar) {
    killModal();
  },
  'click #execute'(event) {
    globalObj.modalCallback();
    killModal();
  }
});

function killModal() {
  const settings = Object.assign({
    complete() {
      Session.set('showModal', false);
      displayModal(false);
    },
  }, animationSettings);
  $('.modal').velocity({ opacity: '0' }, settings);
}
