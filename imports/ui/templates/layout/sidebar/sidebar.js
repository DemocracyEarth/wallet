import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import './sidebar.html';
import '../../components/collective/collective.js';
import '../../widgets/inbox/inbox.js';

Template.sidebar.onRendered(() => {
  if (Session.get('sidebar') === true && $('#menu').css('margin-left') === '-320px') {
    Session.set('sidebar', false);
  }
});

Template.sidebar.helpers({
  decisions() {
    return Session.get('menuDecisions');
  },
  personal() {
    return Session.get('menuPersonal');
  },
  delegates() {
    return Session.get('menuDelegates');
  },
});
