import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { animatePopup } from '/imports/ui/modules/popup';
import './popup.html';

Template.popup.onRendered(() => {
  Session.set('displayPopup', false);
});

function _getData(source, id, key) {
  for (let i = 0; i < source.length; i += 1) {
    if (source[i].id === id) {
      if (!key) {
        return source[i];
      }
      return source[i][key];
    }
  }
  return undefined;
}

Template.popup.helpers({
  visible() {
    animatePopup(Session.get('displayPopup'), this.id);
  },
  content() {
    return _getData(Session.get('popupList'), this.id).template;
  },
  dataObject() {
    return _getData(Session.get('popupList'), this.id).params;
  },
});

Template.popup.events({
  'mouseleave .popup'() {
    if (_getData(Session.get('popupList'), this.id).template === 'card') {
      if (Session.get('displayPopup') && !Session.get('dragging')) {
        Session.set('displayPopup', false);
      }
    }
  },
});
