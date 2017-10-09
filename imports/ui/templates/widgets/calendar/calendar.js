import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { Contracts } from '/imports/api/contracts/Contracts';
import { animationSettings } from '/imports/ui/modules/animation';

import './calendar.html';

function initCalendar(template) {
  if ($('#date-picker').html() === '') {
    $('#date-picker').datepicker();
    $('#date-picker').on('changeDate', (e) => {
      const currentDate = new Date();
      if (currentDate.getTime() < e.date.getTime()) {
        Session.set('backdating', false);
        Session.set('showCalendar', !Session.get('showCalendar'));
        Contracts.update(template.contract.get()._id, { $set: { permanentElection: false, closingDate: e.date } });
      } else {
        Session.set('backdating', true);
        Session.set('showCalendar', !Session.get('showCalendar'));
      }
    });
  }
}

Template.calendar.onCreated(() => {
  Template.instance().contract = new ReactiveVar(Template.currentData().contract);
  Session.set('showCalendar', false);
});

Template.dateSelector.onCreated(() => {
  Template.instance().contract = new ReactiveVar(Template.currentData().contract);
});


Template.dateSelector.onRendered(() => {
  // intro animation
  if (!Meteor.Device.isPhone()) {
    $('.calendar').css('height', '0');
    $('.calendar').css('overflow', 'hidden');
    $('.calendar').velocity({ height: '260px' }, animationSettings);
  }

  initCalendar(Template.instance());
});

Template.calendar.helpers({
  closingDate() {
    const today = new Date();
    const contract = Contracts.findOne({ _id: Template.instance().contract.get()._id });
    let d = new Date();
    if (contract.permanentElection) {
      return TAPi18n.__('always-on');
    }
    if (today > contract.closingDate) {
      d = today.setDate(today.getDate() + 1);
      Contracts.update(contract._id, { $set: { closingDate: d } });
    }
    return contract.closingDate.format('{Month} {d}, {yyyy}');
  },
  toggleStatus() {
    if (Session.get('showCalendar')) {
      return 'calendar-menu-active';
    }
    return '';
  },
  displayCalendar(icon) {
    if (icon) {
      if (Session.get('showCalendar')) {
        return 'display:none';
      }
      return '';
    } else if (Session.get('showCalendar')) {
      return '';
    }
    Session.set('showCalendar', false);
    return 'display:none';
  },
  displaySelector() {
    return Session.get('showCalendar');
  },
});

Template.calendar.events({
  'click #toggleCalendar'() {
    initCalendar(Template.instance());
    Session.set('showCalendar', !Session.get('showCalendar'));
  },
});

Template.dateSelector.helpers({
  permanent() {
    if (Template.instance().contract.get().permanentElection) {
      return 'calendar-button-selected';
    }
    return '';
  },
});

Template.dateSelector.events({
  'click #date-always-on'() {
    Contracts.update(Template.instance().contract.get()._id, { $set: { permanentElection: !Template.instance().contract.get().permanentElection } });
    Session.set('backdating', false);
    Session.set('showCalendar', !Session.get('showCalendar'));
  },
});
