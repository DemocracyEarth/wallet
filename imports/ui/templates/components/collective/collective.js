import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Counts } from 'meteor/tmeasday:publish-counts';

import './collective.html';

Template.collective.onCreated(function () {
  Template.instance().members = new ReactiveVar(0);

  const instance = this;

  instance.autorun(function () {
    const count = instance.subscribe('userCount');
    if (count.ready()) {
      instance.members.set(Counts.get('totalUsers'));
    }
  });
});

Template.collective.helpers({
  title() {
    return Meteor.settings.public.Collective.name;
  },
  description() {
    return Meteor.settings.public.Collective.profile.bio;
  },
  picture() {
    if (Meteor.settings.public.Collective.profile.logo) {
      return Meteor.settings.public.Collective.profile.logo;
    }
    return 'images/earth.png';
  },
  hasLogo() {
    return (Meteor.settings.public.Collective.profile.logo !== undefined);
  },
  members() {
    const count = Template.instance().members.get();
    if (count === 1) {
      return `${count} ${TAPi18n.__('member')}`;
    }
    return `${count} ${TAPi18n.__('members')}`;
  },
});

Template.collective.events({
  'click #collective-home'() {
    Router.go('/');
  },
});
