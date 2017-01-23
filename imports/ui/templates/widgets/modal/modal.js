import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { animationSettings } from '/imports/ui/modules/animation';
import { displayModal } from '/imports/ui/modules/modal';
import { globalObj } from '/lib/global';

import './modal.html';
import '../../components/identity/avatar/avatar.js';

function killModal() {
  const settings = Object.assign({
    complete() {
      Session.set('showModal', false);
      displayModal(false);
    },
  }, animationSettings);
  $('.modal').velocity({ opacity: '0' }, settings);
}

Template.modal.helpers({
  showModal() {
    return Session.get('showModal');
  },
});

Template.modalWindow.rendered = function rendered() {
  // initial position
  const paddingTotal = parseInt($('.alert').css('padding-bottom'), 10) + parseInt($('.alert').css('padding-top'), 10);
  let alertHeight = parseInt((window.innerHeight / 2) - (($('.alert').height() + paddingTotal) / 2), 10);
  if (alertHeight > 200) {
    alertHeight = 200;
  }

  // intro animation
  $('.alert').css(`margin-top${alertHeight}p`);
  $('.modal').css('opacity', '0');
  $('.modal').velocity({ opacity: '1' }, animationSettings);
};

Template.modalWindow.helpers({
  icon() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').icon;
    }
    return '';
  },
  title() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').title;
    }
    return '';
  },
  message() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').message;
    }
    return '';
  },
  cancel() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').cancel;
    }
    return '';
  },
  action() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').action;
    }
    return '';
  },
  displayProfile() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').displayProfile;
    }
    return '';
  },
  profileId() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').profileId;
    }
    return '';
  },
  visible() {
    if (Session.get('displayModal') !== undefined) {
      if (Session.get('displayModal').visible === true) {
        return '';
      }
    }
    return 'hide';
  },
});

Template.modalWindow.events({
  'click #modalToggle'() {
    // Modules.client.displayModal(false);
  },
  'click #cancel'() {
    killModal();
  },
  'click #execute'() {
    globalObj.modalCallback();
    killModal();
  },
});
