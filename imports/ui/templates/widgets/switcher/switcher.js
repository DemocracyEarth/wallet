import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';

import '/imports/ui/templates/widgets/switcher/switcher.html';

Template.switcher.onRendered(function () {
  console.log(`switcher: ${JSON.stringify(Template.currentData())}`);
  Session.set('cachedDraft', Session.get('draftContract'));
});

Template.switcher.helpers({
  option() {
    const processed = this.option;

    // put selected as true
    for (let i = 0; i < processed.length; i += 1) {
      processed[i].value = false;
    }
    processed[this.selected].value = true;

    return processed;
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
  'click #cancel-calendar'() {
  },
});
