import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { createContract } from '/imports/startup/both/modules/Contract';

import './touchmenu.html';

Template.touchmenu.onRendered(() => {
});

Template.touchmenu.helpers({
});

Template.touchmenu.events({
  'click #post'() {
    createContract();
  },
});
