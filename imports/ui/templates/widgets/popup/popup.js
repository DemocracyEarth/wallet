import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { animatePopup } from '/imports/ui/modules/popup';
import './popup.html';

Template.popup.onRendered(() => {
  Session.set('displayPopup', false);
});

function _getData(source, id, key) {
  for (let i = 0; i < source.length; i += 1) {
    console.log(`id of this object is ${id}`);
    if (source[i].id === id) {
      return source[key];
    }
  }
  return undefined;
}

Template.popup.helpers({
  visible() {
    animatePopup(Session.get('displayPopup'));
  },
  content() {
    // return Session.get('popupTemplate');
    /* let list = Session.get('popupList');
    for (let i = 0; i < list.length; i += 1) {
      if (list[i].id === this.id) {
        return this.template;
      }
    }*/
    console.log(this);
    return _getData(Session.get('popupList'), this.id, 'template');
  },
  dataObject() {
    return Session.get('popupData');
  },
});

Template.popup.events({
  'mouseleave .popup'() {
    if (Session.get('popupTemplate') === 'card') {
      if (Session.get('displayPopup') && !Session.get('dragging')) {
        Session.set('displayPopup', false);
      }
    }
  },
});
