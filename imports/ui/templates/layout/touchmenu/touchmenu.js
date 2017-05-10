import { Meteor } from 'meteor/meteor';
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
    $('.voice').css('display', '');
    $('#titleContent').focus();
  },
});
