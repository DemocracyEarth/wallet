import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { animatePopup } from '/imports/ui/modules/popup';

Template.login.onRendered = function onRender() {
};

Template.login.events({
  'click #logout'() {
    Session.set('displayPopup', false);
    Session.set('logger', false);
    animatePopup(false);
    Meteor.logout();
    Router.go('/');
  },
});
