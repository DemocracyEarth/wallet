import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { templetize, getImage } from '/imports/ui/templates/layout/templater';

import '/imports/ui/templates/layout/url/synchronizer/synchronizer.html';

Template.synchronizer.onCreated(function () {
  Template.instance().imageTemplate = new ReactiveVar();
  const instance = Template.instance();
  templetize(instance);
});

Template.synchronizer.helpers({
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
});
