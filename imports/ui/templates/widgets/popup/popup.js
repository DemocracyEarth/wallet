import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { animatePopup, getPopup } from '/imports/ui/modules/popup';
import './popup.html';

Template.popup.helpers({
  visible() {
    animatePopup(getPopup(Session.get('popupList'), this.id).visible, this.id);
  },
  content() {
    return getPopup(Session.get('popupList'), this.id).template;
  },
  dataObject() {
    return getPopup(Session.get('popupList'), this.id).params;
  },
});

Template.popup.events({
  'mouseleave .popup'() {
    const popup = getPopup(Session.get('popupList'), this.id);
    if (popup.template === 'card' && !Session.get('dragging')) {
      animatePopup(false, this.id);
    }
  },
});
