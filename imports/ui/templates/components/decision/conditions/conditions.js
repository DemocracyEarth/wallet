import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import './conditions.html';
import '../../../widgets/toggle/toggle.js';

Template.conditions.helpers({
  transferable() {
    return Session.get('contract').transferable;
  },
  portable() {
    return Session.get('contract').portable;
  },
  limited() {
    return Session.get('contract').limited;
  },
});
