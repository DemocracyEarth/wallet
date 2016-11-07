import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { animationSettings } from '/imports/ui/modules/animation';
import { modalCallback, displayModal } from '/imports/ui/modules/modal';

import './modal.html';

Template.modal.helpers({
  showModal() {
    return Session.get('showModal');
  }
});


Template.modalWindow.onRendered = function onRender() {
  //Initial position
  const paddingTotal = parseInt($('.alert').css('padding-bottom')) + parseInt($('.alert').css('padding-top'));
  let alertHeight = parseInt( (window.innerHeight / 2) - ( ($('.alert').height() + paddingTotal) / 2));
  if (alertHeight > 200) {
    alertHeight = 200;
  }

  //Intro animation
  $('.alert').css('margin-top', alertHeight + 'px');
  $('.modal').css('opacity', '0');
  $('.modal').velocity({'opacity': '1'}, animationSettings);

};

Template.modalWindow.helpers({
  icon: function () {
    if (Session.get('displayModal') != undefined) {
      return Session.get('displayModal').icon;
    }
  },
  title: function () {
    if (Session.get('displayModal') != undefined) {
      return Session.get('displayModal').title;
    }
  },
  message: function () {
    if (Session.get('displayModal') != undefined) {
      return Session.get('displayModal').message;
    }
  },
  cancel: function () {
    if (Session.get('displayModal') != undefined) {
      return Session.get('displayModal').cancel;
    }
  },
  action: function () {
    if (Session.get('displayModal') != undefined) {
      return Session.get('displayModal').action;
    }
  },
  displayProfile: function () {
    if (Session.get('displayModal') != undefined) {
      return Session.get('displayModal').displayProfile;
    }
  },
  profileId: function () {
    if (Session.get('displayModal') != undefined) {
      return Session.get('displayModal').profileId;
    }
  },
  visible: function () {
    if (Session.get('displayModal') != undefined) {
      if (Session.get('displayModal').visible == true) {
        return '';
      }
    }
    return 'hide';
  }
});

Template.modalWindow.events({
  'click #modalToggle': function () {
    //Modules.client.displayModal(false);
  },
  'click #cancel': function (event, sessionVar) {
    killModal();
  },
  'click #execute': function (event) {
    modalCallback();
    killModal();
  }
})

function killModal () {
  var settings = Object.assign({
    complete: function () {
      Session.set('showModal', false);
      displayModal(false);
    }
  }, animationSettings);
  $('.modal').velocity({'opacity': '0'}, settings);
}
