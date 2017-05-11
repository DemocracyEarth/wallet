import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { timers } from '/lib/const';

import { createContract } from '/imports/startup/both/modules/Contract';

import './touchmenu.html';

Template.touchmenu.onRendered(() => {
});

Template.touchmenu.helpers({
});

Template.touchmenu.events({
  'click #button-post'() {
    createContract();
    $('#post-editor').css('margin-top', `${$(window).height()}px`);
    $('#post-editor').css('display', '');

    $('#post-editor').velocity({ 'margin-top': '0px' }, {
      duration: timers.ANIMATION_DURATION,
      complete: () => {
        $('#titleContent').focus();
      },
    });

    //
    $('#mobileKeyboard').focus();
  },
});
