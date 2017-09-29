import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { animatePopup } from '/imports/ui/modules/popup';
import { animationSettings } from '/imports/ui/modules/animation';

import './popup.html';

function autoPosition(height) {
  const screenH = $(window).height();
  let pos = parseInt(((screenH - height) / 2) - 10, 10);
  if (pos <= 70) { pos = 70; }
  return pos;
}

Template.popup.onRendered(() => {
  $(`#card-${Template.instance().data.id}`).attr('legacyheight', $(`#card-${Template.instance().data.id}`)[0].getBoundingClientRect().height);
  $(`#card-${Template.instance().data.id}`).resize(function () {
    if (Meteor.Device.isPhone()) {
      const divId = `#${this.id}`;
      if (!$(divId).is('.velocity-animating')) {
        const newMargin = autoPosition($(divId)[0].getBoundingClientRect().height);
        const newHeight = $(divId)[0].getBoundingClientRect().height;
        // $(divId).css('height', $(divId).attr('legacyheight'));
        $(divId).velocity({ marginTop: newMargin }, { duration: animationSettings.duration, easing: 'ease-out' });
        Meteor.setTimeout(function () {
          $(divId).velocity('stop');
          $(divId).attr('legacyheight', newHeight);
        }, animationSettings.duration);
      }
    }
  });
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
      return `margin-top: ${autoPosition($(`#card-${this.id}`)[0].getBoundingClientRect().height)}px;`;
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
