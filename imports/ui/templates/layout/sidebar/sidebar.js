import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import './sidebar.html';
import '../../components/collective/collective.js';
import '../../widgets/inbox/inbox.js';

Template.sidebar.onRendered = function onRender() {
  if (Session.get('sidebar') == true && $('#menu').css('margin-left') == "-320px") {
    Session.set('sidebar', false);
  }
}
Template.sidebar.helpers({
  decisions: function () {
    return Session.get('menuDecisions');
  },
  personal: function () {
    return Session.get('menuPersonal');
  },
  delegates: function () {
    return Session.get('menuDelegates');
  }
});
