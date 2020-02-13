import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import '/imports/ui/templates/widgets/help/help.html';

Template.help.onCreated(function () {
  Template.instance().showTooltip = new ReactiveVar(false);
});

Template.help.helpers({
  showTooltip() {
    return Template.instance().showTooltip.get();
  },
});

Template.help.events({
  'mouseenter .help'() {
    Template.instance().showTooltip.set(true);
  },
  'mouseleave .help'() {
    Template.instance().showTooltip.set(false);
  },
});
