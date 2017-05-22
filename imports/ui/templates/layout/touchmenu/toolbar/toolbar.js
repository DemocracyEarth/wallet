import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';

import { publishContract } from '/imports/startup/both/modules/Contract';
import { displayNotice } from '/imports/ui/modules/notice';


import './toolbar.html';

function isDisabled() {
  return (Session.get('missingTitle') || Session.get('mistypedTitle') || Session.get('duplicateURL') || (Session.get('availableChars') < 0));
}

Template.toolbar.onRendered(() => {
});

Template.toolbar.helpers({
  disabled() {
    if (isDisabled()) {
      return 'mobile-button-disabled';
    }
    return '';
  },
});

Template.toolbar.events({
  'click #mobile-post-button'() {
    if (!isDisabled()) {
      publishContract(Session.get('contract')._id);
      displayNotice(TAPi18n.__('posted-idea'), true);
      Session.set('displayToolbar', false);
    }
  },
});

Template.counter.helpers({
  characters() {
    return Session.get('availableChars');
  },
  excess() {
    if (Session.get('availableChars') <= 20) {
      return 'counter-excess';
    }
    return '';
  },
});
