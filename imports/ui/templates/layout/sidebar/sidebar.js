import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { gui } from '/lib/const';

import './sidebar.html';
import '../../components/collective/collective.js';
import '../../widgets/inbox/inbox.js';

Template.sidebar.onRendered(() => {
  $('.left').width(`${gui.SIDEBAR_WIDTH_PERCENTAGE}%`);

  if (Session.get('sidebar') === true && $('#menu').css('margin-left') === `-${gui.SIDEBAR_WIDTH_PERCENTAGE}%`) {
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
