import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { blocktimes } from '/lib/const';
import { getBlockHeight } from '/imports/startup/both/modules/metamask.js';

import '/imports/ui/templates/components/decision/countdown/countdown.html';

Template.countdown.onCreated(async function () {
  Template.instance().currentBlock = new ReactiveVar(await getBlockHeight());
});

Template.countdown.onRendered(function () {
  console.log(Template.currentData());
});

Template.countdown.helpers({
  label() {
    const countdown = TAPi18n.__('countdown-expiration');
    return countdown;
  },
  timerStyle() {
    return 'width: 100%';
  },
});
