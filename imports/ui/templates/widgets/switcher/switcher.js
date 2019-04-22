import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import '/imports/ui/templates/widgets/switcher/switcher.html';

Template.switcher.onRendered(function () {
  Session.set('cachedDraft', Session.get('draftContract'));
});

Template.switcher.helpers({
  option() {
    return this.option;
  },
});

Template.switch.helpers({
  selected() {
    if (this.value) {
      return 'switch-button-selected';
    }
    return '';
  },
});

Template.switcher.events({
  'click #switch-button'() {
    this.action();
  },
});
