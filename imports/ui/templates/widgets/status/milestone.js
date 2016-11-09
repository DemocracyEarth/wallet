import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';

import './status.html';

//Mileston status of current contract
Template.milestone.helpers({
  status(number, currentStep) {
    if (number < currentStep) {
      return '';
    } else if (number === currentStep) {
      return 'current';
    }
    return 'disabled';
  },
  text(number) {
    return TAPi18n.__('milestone_' + number.toString());
  },
  tick(number, currentStep) {
    if (number < currentStep) {
        return '&#10003;';
    } else {
      return number;
    }
  },
  progressbar(number, max, currentStep) {
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
