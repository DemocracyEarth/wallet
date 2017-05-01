import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { animatePopup, clearPopups } from '/imports/ui/modules/popup';

import './popup.html';

Template.popup.helpers({
  content() {
    return Session.get(this.id).template;
  },
  dataObject() {
    return Session.get(this.id).params;
  },
  mobile() {
    return Meteor.Device.isPhone();
  },
});

Template.popup.events({
  'mouseleave .popup'() {
    const popup = Session.get(this.id);
    if (popup.template === 'card' && !Session.get('dragging')) {
      animatePopup(false, this.id);
    }
  },
  'click .modal'(event) {
    event.stopPropagation();
    if (event.target.id === this.id) {
      console.log(this.id);
      $(`#${this.id}`)[0].style.visibility = 'hidden';
    }
  },
});
