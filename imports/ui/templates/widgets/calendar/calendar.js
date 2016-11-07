import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { animationSettings } from '/imports/ui/modules/animation';

Template.dateSelector.onRendered = function onRender() {
  //behave(this.firstNode, 'fade', { duration: parseInt(ANIMATION_DURATION / 2) });

  //Intro animation
  $('.calendar').css('height', '0');
  $('.calendar').css('overflow', 'hidden');
  $('.calendar').velocity({'height': '260px'}, animationSettings);

  initCalendar();
}

Template.calendar.helpers({
  closingDate: function () {
    var today = new Date();
    var d = new Date();
    if (today > Session.get('contract').closingDate) {
      var contract = Session.get('contract');
      contract.closingDate = today
      contract.closingDate.setDate(today.getDate() + 1);
      Session.set('contract', contract);
    }
    d = Session.get('contract').closingDate;
    return d.format('{Month} {d}, {yyyy}');
  },
  toggleStatus: function () {
    if (Session.get('showCalendar')) {
      return 'calendar-menu-active';
    } else {
      return '';
    }
  },
  displayCalendar: function (icon) {
    if (icon == true) {
      if (Session.get('showCalendar') == true) {
        return 'display:none';
      } else {
        return '';
      }
    } else {
      if (Session.get('showCalendar') == undefined) {
        Session.set('showCalendar', false);
      } else if (Session.get('showCalendar') == true) {
        return '';
      } else {
        return 'display:none';
      }
    }
  },
  displaySelector: function () {
    return (Session.get('displaySelector'));
  }
});

Template.calendar.events({
  "click #toggleCalendar": function () {
    initCalendar();
    Session.set('displaySelector', !Session.get('displaySelector'));
    Session.set('showCalendar', !Session.get('showCalendar'));
  }
})

function initCalendar() {
  if ($('#date-picker').html() == "") {
    $('#date-picker').datepicker();
    $('#date-picker').on('changeDate', function (e) {
      currentDate = new Date;
      if (currentDate.getTime() < e.date.getTime()) {
        Session.set('backdating', false);
        Session.set('showCalendar', !Session.get('showCalendar'));
        Session.set('displaySelector', !Session.get('displaySelector'));
        Meteor.call('updateContractField', Session.get('contract')._id, "closingDate", e.date);
      } else {
        Session.set('backdating', true);
      }
    });
  }
}
