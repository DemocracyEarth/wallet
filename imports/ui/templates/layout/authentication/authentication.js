import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { displayLogin } from '/imports/ui/modules/popup';

Template.authentication.onRendered = function onRender() {
  Session.set('logger', false);
};

Template.authentication.helpers({
  toggle() {
    if (Session.get('logger')) {
      return 'navbar-button-active';
    }
    return '';
  },
});

Template.authentication.events({
  'click #loggedUser': function (event) {
    displayLogin(event);
  }
});
