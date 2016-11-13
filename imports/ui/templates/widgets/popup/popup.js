import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { animatePopup } from '/imports/ui/modules/popup'
import './popup.html';

Template.popup.rendered = function rendered() {
  Session.set('displayPopup', false);
};

Template.popup.helpers({
  visible: function () {
    animatePopup(Session.get('displayPopup'));
  },
  content: function () {
    return Session.get('popupTemplate');
  },
  dataObject: function () {
    return Session.get('popupData');
  }
});

Template.popup.events({
  'mouseleave .popup': function (event) {
    if (Session.get('popupTemplate') == 'card') {
      if (Session.get('displayPopup')) {
        Session.set('displayPopup', false);
      }
    }
  }
})
