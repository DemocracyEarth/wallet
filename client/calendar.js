if (Meteor.isClient) {

  Template.calendar.helpers({
    closingDate: function () {
      var d = new Date()
      d = getContract().closingDate;
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
    }
  });

  Template.calendar.events({
    "click #toggleCalendar": function () {
      initCalendar();
      Session.set('showCalendar', !Session.get('showCalendar'));  
    }
  })

}

function initCalendar () {
  if ($('#date-picker').html() == "") {
    $('#date-picker').datepicker();

    $('#date-picker').on('changeDate', function (e) {
      currentDate = new Date;
      if (currentDate.getTime() < e.date.getTime()) {
        Session.set('backdating', false);
        Meteor.call('updateContractField', getContract()._id, "closingDate", e.date);
      } else {
        Session.set('backdating', true);
      }
    });
  }
}
