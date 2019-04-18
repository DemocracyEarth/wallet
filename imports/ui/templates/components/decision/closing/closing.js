import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';


import { displayPopup } from '/imports/ui/modules/popup';
import { toggle } from '/imports/ui/templates/components/decision/editor/editor.js';
import { templetize, getImage } from '/imports/ui/templates/layout/templater';

import '/imports/ui/templates/components/decision/closing/closing.html';
import '/imports/ui/templates/components/decision/calendar/calendar.js';

const _killPopup = () => {
  // toggle('constituencyEnabled', !Session.get('draftContract').closing.alwaysOn);
  if (Session.get('showClosingEditor')) {
    Session.set('showClosingEditor', false);
  } else {
    Session.set('showClosingEditor', true);
  }
  displayPopup($('#closing-button')[0], 'calendar', Meteor.userId(), 'click', 'calendar-popup');
};

Template.closing.onCreated(function () {
  Template.instance().imageTemplate = new ReactiveVar();
  templetize(Template.instance());
});

Template.closing.helpers({
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
  status() {
    return TAPi18n.__('closing-date');
  },
  closingId() {
    if (!this.readOnly) {
      return 'closing-button';
    }
    return '';
  },
});

Template.closing.events({
  'click #closing-button'() {
    if (!this.readOnly) {
      _killPopup();
    }
  },
});

