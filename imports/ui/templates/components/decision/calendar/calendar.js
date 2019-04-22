import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { animatePopup } from '/imports/ui/modules/popup';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';

import '/imports/ui/templates/components/decision/calendar/calendar.html';
import '/imports/ui/templates/widgets/switcher/switcher.js';

Template.calendar.onRendered(function () {
  Session.set('cachedDraft', Session.get('draftContract'));
});

Template.calendar.helpers({
  alwaysOn() {
    return (Session.get('cachedDraft') && Session.get('cachedDraft').rules) ? Session.get('cachedDraft').rules.alwaysOn : false;
  },
  timers() {
    return {
      selected: 0,
      option: [
        {
          value: false,
          label: 'blockchain-time-daily',
          action: () => {

          },
        },
        {
          value: false,
          label: 'blockchain-time-weekly',
          action: () => {

          },
        },
        {
          value: false,
          label: 'blockchain-time-monthly',
          action: () => {

          },
        },
        {
          value: false,
          label: 'blockchain-time-quarterly',
          action: () => {

          },
        },
        {
          value: false,
          label: 'blockchain-time-annual',
          action: () => {

          },
        },
      ],
    };
  },
});

Template.calendar.events({
  'click #cancel-calendar'() {
    animatePopup(false, 'calendar-popup');
    Session.set('showClosingEditor', false);
  },
});
