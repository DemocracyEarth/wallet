import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import './counter.html';

Template.counter.helpers({
  characters() {
    return Session.get('availableChars');
  },
  excess() {
    if (Session.get('availableChars') <= 20) {
      return 'counter-excess';
    }
    return '';
  },
});
