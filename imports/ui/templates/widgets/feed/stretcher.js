import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import '/imports/ui/templates/widgets/feed/stretcher.html';

/**
 * @summary stretch div based on difference
 */
const _stretch = () => {
  if (!Meteor.Device.isPhone()) {
    const left = $('.split-left').height();
    const right = $('.split-right').height();
    if (right > left) { $('#stretcher').height(parseInt(right - left, 10)); }
    console.log(`left: ${left}`);
    console.log(`right: ${right}`);
    console.log($('#stretcher').height());
  }
};

Template.stretcher.onRendered(() => {
  _stretch();
});

export const stretch = _stretch;
