import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';

import { animationSettings } from '/imports/ui/modules/animation';
import { updateContract } from '/lib/utils';

import './calendar.html';

function hideSelector() {
  Session.set('backdating', false);
  Session.set('showCalendar', !Session.get('showCalendar'));
  Session.set('displaySelector', !Session.get('displaySelector'));
}

function initCalendar() {
  if ($('#date-picker').html() === '') {
    $('#date-picker').datepicker();
    $('#date-picker').on('changeDate', (e) => {
      const currentDate = new Date();
      if (currentDate.getTime() < e.date.getTime()) {
        hideSelector();
        updateContract('permanentElection', false);
        updateContract('closingDate', e.date);
      } else {
        Session.set('backdating', true);
        Session.set('showCalendar', !Session.get('showCalendar'));
        Session.set('displaySelector', !Session.get('displaySelector'));
      }
    });
  }
}

Template.dateSelector.onRendered(() => {
  // intro animation
  if (!Meteor.Device.isPhone()) {
    $('.calendar').css('height', '0');
    $('.calendar').css('overflow', 'hidden');
    $('.calendar').velocity({ height: '260px' }, animationSettings);
  }

  initCalendar();
});

Template.calendar.helpers({
  closingDate() {
    const today = new Date();
    let d = new Date();
    if (Session.get('contract').permanentElection) {
      return TAPi18n.__('always-on');
    }
    if (today > Session.get('contract').closingDate) {
      const contract = Session.get('contract');
      contract.closingDate = today;
      contract.closingDate.setDate(today.getDate() + 1);
      Session.set('contract', contract);
    }
    d = Session.get('contract').closingDate;
    return d.format('{Month} {d}, {yyyy}');
  },
  toggleStatus() {
    if (Session.get('showCalendar')) {
      return 'calendar-menu-active';
    }
    return '';
  },
  displayCalendar(icon) {
    if (icon) {
      if (Session.get('showCalendar') === true) {
        return 'display:none';
      }
      return '';
    } else if (Session.get('showCalendar') === undefined) {
      Session.set('showCalendar', false);
    } else if (Session.get('showCalendar') === true) {
      return '';
    }
    return 'display:none';
  },
  displaySelector() {
    return (Session.get('displaySelector'));
  },
});

Template.calendar.events({
  'click #toggleCalendar'() {
    initCalendar();
    Session.set('displaySelector', !Session.get('displaySelector'));
    Session.set('showCalendar', !Session.get('showCalendar'));
  },
});

Template.dateSelector.helpers({
  permanent() {
    if (Session.get('contract').permanentElection) {
      return 'calendar-button-selected';
    }
    return '';
  },
});

Template.dateSelector.events({
  'click #date-always-on'() {
    updateContract('permanentElection', !Session.get('contract').permanentElection);
    hideSelector();
  },
});
