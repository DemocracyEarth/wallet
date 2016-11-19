import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { animatePopup } from '/imports/ui/modules/popup';
import './popup.html';

Template.popup.onRendered(() => {
  Session.set('displayPopup', false);
});

Template.popup.helpers({
  visible() {
    animatePopup(Session.get('displayPopup'));
  },
  content() {
    return Session.get('popupTemplate');
  },
  dataObject() {
    return Session.get('popupData');
  },
});

Template.popup.events({
  'mouseleave .popup'() {
    if (Session.get('popupTemplate') === 'card') {
      if (Session.get('displayPopup')) {
        Session.set('displayPopup', false);
      }
    }
  },
});
