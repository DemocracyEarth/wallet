import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

Template.agora.helpers({
  emptyThread() {
    if (Session.get('contract')) {
      if (Session.get('contract').events !== undefined) {
        if (Session.get('contract').events.length > 0) {
          return false;
        }
        return true;
      }
      return true;
    }
    return undefined;
  },
  event() {
    if (Session.get('contract')) {
      return Session.get('contract').events;
    }
    return undefined;
  },
});
