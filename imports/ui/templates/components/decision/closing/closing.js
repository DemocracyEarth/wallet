import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { templetize, getImage } from '/imports/ui/templates/layout/templater';

import '/imports/ui/templates/components/decision/closing/closing.html';

Template.closing.onCreated(function () {
  Template.instance().imageTemplate = new ReactiveVar();
  templetize(Template.instance());
});

Template.closing.helpers({
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
});
