import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

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

Template.home.onRendered(() => {
  Session.set('editorMode', false);
});

Template.home.helpers({
  editorMode() {
    return Session.get('showPostEditor');
  },
  newContractId() {
    return Session.get('draftContract')._id;
  },
});
