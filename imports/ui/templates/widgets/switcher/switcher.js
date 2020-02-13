import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import '/imports/ui/templates/widgets/switcher/switcher.html';

Template.switcher.onRendered(function () {
  Session.set('cachedDraft', Session.get('draftContract'));
});

Template.switcher.helpers({
  option() {
    const option = this.option;
    for (let i = 0; i < option.length; i += 1) {
      option[i].enabled = this.enabled;
    }
    return this.option;
  },
  style() {
    if (!this.enabled) {
      return 'switcher-disabled';
    }
    return '';
  },
});

Template.switch.helpers({
  selected() {
    if (!this.enabled) {
      return 'switch-button-disabled';
    }
    if (this.value) {
      return 'switch-button-selected';
    }
    return '';
  },
});

Template.switcher.events({
  'click #switch-button'() {
    if (this.enabled) {
      this.action();
    }
  },
});
