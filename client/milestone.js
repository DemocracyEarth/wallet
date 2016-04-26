if (Meteor.isClient) {

    //Mileston status of current contract
    Template.milestone.helpers({
      status: function(number, currentStep) {
          if (number < currentStep) {
            return '';
          } else if (number == currentStep) {
            return 'current';
          } else {
            return 'disabled';
          }
      },
      text: function(number) {
        return TAPi18n.__('milestone_' + number.toString());
      },
      tick: function(number, currentStep) {
        if (number < currentStep) {
            return '&#10003;';
        } else {
          return number;
        }
      },
      progressbar: function(number, max, currentStep) {
        if (number < max) {
          if (number < currentStep) {
            return 'progress-bar completed';
          } else {
            return 'progress-bar';
          }
        } else {
          return '';
        }
      }
    });
}
