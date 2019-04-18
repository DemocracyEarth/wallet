import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';

import '/imports/ui/templates/components/decision/calendar/calendar.html';

Template.calendar.onRendered(function () {
  Session.set('cachedDraft', Session.get('draftContract'));
});

Template.calendar.helpers({
  alwaysOn() {
    return (Session.get('cachedDraft') && Session.get('cachedDraft').rules) ? Session.get('cachedDraft').rules.alwaysOn : false;
  },
});
