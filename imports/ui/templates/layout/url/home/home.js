import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './home.html';
import '../../../widgets/feed/feed.js';
import '../../../widgets/compose/compose.js';

Template.home.helpers({
  mobileStyle() {
    if (Meteor.Device.isPhone()) {
      return 'margin-bottom: 56px;';
    }
    return '';
  },
});
