import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import './voice.html';

Template.voice.helpers({
  display() {
    if (Session.get('showEditor')) {
      return '';
    }
    return 'display: none';
  },
});
