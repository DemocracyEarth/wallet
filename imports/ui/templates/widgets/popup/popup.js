import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { animatePopup, getPopup } from '/imports/ui/modules/popup';
import './popup.html';

Template.popup.helpers({
  visible() {
    animatePopup(Session.get(this.id).visible, this.id);
  },
  content() {
    return Session.get(this.id).template;
  },
  dataObject() {
    return Session.get(this.id).params;
  },
});

Template.popup.events({
  'mouseleave .popup'() {
    const popup = Session.get(this.id); // getPopup(Session.get('popupList'), this.id);
    if (popup.template === 'card' && !Session.get('dragging')) {
      animatePopup(false, this.id);
    }
  },
});
