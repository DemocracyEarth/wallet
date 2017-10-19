import { $ } from 'meteor/jquery';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { gui } from '/lib/const';

import './home.html';
import '../../../widgets/feed/feed.js';
import '../../../widgets/feed/paginator.js';
import '../../../widgets/compose/compose.js';

/**
NOTE: deprecated since touchmenu is no longer in use.
Template.home.helpers({
  mobileStyle() {
    if (Meteor.Device.isPhone()) {
      return 'margin-bottom: 56px;';
    }
    return '';
  },
});
*/

Template.home.onRendered(function () {

});
