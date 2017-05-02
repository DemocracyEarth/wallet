import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { animatePopup } from '/imports/ui/modules/popup';

import './popup.html';


Template.popup.onRendered(() => {
});

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
  modalPosition() {
    if (Session.get(this.id).position.height) {
      const modalH = $(`#card-${this.id}`)[0].getBoundingClientRect().height;
      const screenH = $(window).height();
      let pos = parseInt(((screenH - modalH) / 2) - 10, 10);
      if (pos <= 70) { pos = 70; }
      return `margin-top: ${pos.toString()}px`;
    }
    return '';
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
      animatePopup(false, this.id);
    }
  },
});
