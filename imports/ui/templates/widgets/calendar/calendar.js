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
        console.log(template);
        template.showCalendar.set(!template.showCalendar.get());
        template.displaySelector.set(!template.displaySelector.get());
        Contracts.update(template.contract.get()._id, { $set: { permanentElection: false, closingDate: e.date } });
      } else {
        Session.set('backdating', true);
        template.showCalendar.set(!template.showCalendar.get());
        template.displaySelector.set(!template.displaySelector.get());
      }
    });
  }
}

Template.calendar.onCreated(() => {
  Template.instance().contract = new ReactiveVar(Template.currentData().contract);
  Template.instance().showCalendar = new ReactiveVar(false);
  Template.instance().displaySelector = new ReactiveVar(false);
});

Template.dateSelector.onCreated(() => {
  Template.instance().contract = new ReactiveVar(Template.currentData().contract);
  Template.instance().showCalendar = new ReactiveVar(Template.currentData().showCalendar);
  Template.instance().displaySelector = new ReactiveVar(Template.currentData().displaySelector);
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
      // const contract = Template.instance().contract.get();
      // contract.closingDate = today;
      // contract.closingDate.setDate(today.getDate() + 1);
      d = today.setDate(today.getDate() + 1);
      Contracts.update(contract._id, { $set: { closingDate: d } });
      // Session.set('contract', contract);
    }
    // d = Template.instance().contract.get().closingDate;
    return d.format('{Month} {d}, {yyyy}');
  },
  toggleStatus() {
    if (Template.instance().showCalendar.get()) {
      return 'calendar-menu-active';
    }
    return '';
  },
  displayCalendar(icon) {
    if (icon) {
      if (Template.instance().showCalendar.get()) {
        return 'display:none';
      }
      return '';
    } else if (Template.instance().showCalendar.get()) {
      return '';
    }
    Template.instance().showCalendar.set(false);
    return 'display:none';
  },
  displaySelector() {
    return Template.instance().displaySelector.get();
  },
  showCalendar() {
    return Template.instance().showCalendar.get();
  },
});

Template.calendar.events({
  'click #toggleCalendar'() {
    initCalendar(Template.instance());
    Template.instance().displaySelector.set(!Template.instance().displaySelector.get());
    Template.instance().showCalendar.set(!Template.instance().showCalendar.get());
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
    Template.instance().showCalendar.set(!Template.instance().showCalendar.get());
    Template.instance().displaySelector.set(!Template.instance().displaySelector.get());
  },
});
