import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import './toolbar.html';

function isDisabled() {
  return (Session.get('missingTitle') || Session.get('mistypedTitle') || Session.get('duplicateURL'));
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
});
