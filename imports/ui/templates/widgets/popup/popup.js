import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { animatePopup } from '/imports/ui/modules/popup';
import './popup.html';

Template.popup.helpers({
  content() {
    return Session.get(this.id).template;
  },
  dataObject() {
    return Session.get(this.id).params;
  },
});

Template.popup.events({
  'mouseleave .popup'() {
    const popup = Session.get(this.id);
    if (popup.template === 'card' && !Session.get('dragging')) {
      animatePopup(false, this.id);
    }
  },
});
