import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { animatePopup } from '/imports/ui/modules/popup';
import { animationSettings } from '/imports/ui/modules/animation';

import './popup.html';

function autoPosition(height) {
  console.log('TEST - autoPosition()');
  const screenH = $(window).height();
  let pos = parseInt(((screenH - height) / 2) - 10, 10);
  if (pos <= 70) {
    console.log('TEST - pos <=70');
    pos = 70;
  }
  console.log('TEST - pos: ', pos);
  return pos;
}

Template.popup.onRendered(() => {
  console.log('TEST - onRendered()');
  $(`#card-${Template.instance().data.id}`).attr('legacyheight', $(`#card-${Template.instance().data.id}`)[0].getBoundingClientRect().height);
  $(`#card-${Template.instance().data.id}`).resize(function () {
    if (Meteor.Device.isPhone()) {
      const divId = `#${this.id}`;
      console.log('TEST - divId: ', divId);
      if (!$(divId).is('.velocity-animating')) {
        console.log('TEST - invoke autoPosition from onRendered');
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
    console.log('TEST - modalPosition()');
    if (Session.get(this.id).position.height) {
      console.log('TEST - true IF in modalPosition()');
      console.log('TEST - this.id ', this.id);
      console.log('TEST - invoke autoPosition from modalPosition');
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
    console.log('click');
    console.log(event.target.id);
    console.log(this.id);
    event.stopPropagation();
    if (event.target.id === this.id) {
      animatePopup(false, this.id);
    }
  },
});
