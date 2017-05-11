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
  'click #button-voice'() {
    createContract();
    $('#voice-editor').css('margin-top', '100px');
    $('#voice-editor').css('display', '');

    $('#voice-editor').velocity({ 'margin-top': '0px' }, {
      duration: timers.ANIMATION_DURATION,
    });

    $('#titleContent').focus();
  },
});
