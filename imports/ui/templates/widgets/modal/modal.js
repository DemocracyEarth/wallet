import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { animationSettings } from '/imports/ui/modules/animation';
import { displayModal } from '/imports/ui/modules/modal';
import { globalObj } from '/lib/global';

import './modal.html';
import '../../components/identity/avatar/avatar.js';

function killModal() {
  $('.modal').css('opacity', '0');
  Session.set('showModal', false);
  displayModal(false);
}

Template.modal.helpers({
  showModal() {
    return Session.get('showModal');
  },
});

Template.modalWindow.onRendered(() => {
  // initial position
  const paddingTotal = parseInt($('.alert').css('padding-bottom'), 10) + parseInt($('.alert').css('padding-top'), 10);
  let alertHeight = parseInt((window.innerHeight / 2) - (($('.alert').height() + paddingTotal) / 2), 10);
  if (alertHeight > 200) {
    alertHeight = 200;
  }

  document.getElementsByClassName('modal')[0].addEventListener('touchmove', (e) => { e.preventDefault(); });

  // intro animation
  $('.alert').css('margin-top', `${alertHeight}px`);
  $('.modal').css('opacity', '0');
  $('.modal').velocity({ opacity: '1' }, animationSettings);
});

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
    return false;
  },
  displayBallot() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').displayBallot;
    }
    return false;
  },
  contract() {
    return Session.get('displayModal').contract;
  },
  contractTitle() {
    if (Session.get('displayModal') !== undefined) {
      let text = Session.get('displayModal').contract.title.replace(/<(?:.|\n)*?>/gm, '');
      if (text.length > 100) {
        text = `${text.substring(0, 100)}...`;
      }
      return text;
    }
    return '';
  },
  ballot() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').ballot;
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
  voteMode() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').voteMode;
    }
    return false;
  },
  voteSettings() {
    if (Session.get('displayModal') !== undefined) {
      return Session.get('displayModal').voteSettings;
    }
    return false;
  },
  mini(className) {
    return `${className} ${className}-mini`;
  },
  removal() {
    if (Session.get('displayModal').action === TAPi18n.__('remove')) {
      return 'button-remove';
    }
    return '';
  },
});

Template.modalWindow.events({
  'click #modalToggle'() {
    //Modules.client.displayModal(false);
  },
  'click #cancel'() {
    if (globalObj.modalCancel !== undefined) { globalObj.modalCancel(); }
    killModal();
  },
  'click #execute'() {
    globalObj.modalCallback();
    killModal();
  },
});
