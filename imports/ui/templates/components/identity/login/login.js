import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { templetize, getImage } from '/imports/ui/templates/layout/templater';

import { hideLogin } from '/imports/startup/both/modules/metamask.js';
import { animatePopup } from '/imports/ui/modules/popup';
import './login.html';
import './profile/profile.js';
import './logger.js';

Template.cardNavigation.onCreated(function () {
  Template.instance().imageTemplate = new ReactiveVar();
  templetize(Template.instance());
});

Template.login.onCreated(function () {
  Template.instance().imageTemplate = new ReactiveVar();
  templetize(Template.instance());
});


Template.cardNavigation.helpers({
  main() {
    if (Session.get('cardNavigation')) {
      return false;
    }
    return true;
  },
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
});

Template.login.helpers({
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
});

Template.login.events({
  'click #logout'() {
    // $('.right').css('left', '0px');
    animatePopup(false, `login-${Meteor.userId()}`);
    hideLogin();
    Meteor.logout();
    Router.go('/');
  },
});

Template.cardNavigation.events({
  'click #card-back'() {
    const data = Meteor.user().profile;
    Session.set('newCountry', undefined);
    data.configured = true;
    Meteor.users.update(Meteor.userId(), { $set: { profile: data } });
    Session.set('cardNavigation', false);
  },
});
