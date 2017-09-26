import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './home.html';
import '../../../widgets/feed/feed.js';
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
