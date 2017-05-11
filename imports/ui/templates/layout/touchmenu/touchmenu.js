import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { createContract } from '/imports/startup/both/modules/Contract';

import './touchmenu.html';

Template.touchmenu.onRendered(() => {
});

Template.touchmenu.helpers({
});

Template.touchmenu.events({
  'click #button-post'() {
    createContract();
    $('#mobileKeyboard').focus();
  },
});
