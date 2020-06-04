import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import '/imports/ui/templates/layout/sidebar/sidebar.html';
import '/imports/ui/templates/components/collective/collective.js';
import '/imports/ui/templates/widgets/inbox/inbox.js';

Template.sidebar.onCreated(function () {
  Template.instance().menu = new ReactiveVar();
});

Template.sidebar.helpers({
  delegate() {
    return Template.instance().delegates.get();
  },
  participant() {
    return Template.instance().participants.get();
  },
  member() {
    return Template.instance().members.get();
  },
  members() {
    const count = Template.instance().memberCount.get();
    if (count === 1) {
      return `${count} ${TAPi18n.__('moloch-address')}`;
    }
    return `${count} ${TAPi18n.__('moloch-addresses')}`;
  },
  totalMembers() {
    if (Template.instance().members.get()) {
      return Template.instance().members.get().length;
    }
    return 0;
  },
  replicator() {
    return `<a href="${Meteor.settings.public.web.sites.tokens}" target="_blank" ontouchstart="">${TAPi18n.__('start-a-democracy')}</a>`;
  },
  totalDelegates() {
    if (Template.instance().delegates.get()) {
      return Template.instance().delegates.get().length;
    }
    return 0;
  },
  menu() {
    return Session.get('sidebarMenu');
  },
  sidebarStyle() {
    if (!Meteor.Device.isPhone()) {
      return 'sidebar-desktop';
    }
    return '';
  },
});
