import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
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
  message() {
    if (this.status && this.status.message) {
      return this.status.message;
    }
    return TAPi18n.__('synchronizer-detail');
  },
  percentage() {
    return `${this.status.loadPercentage}%`;
  },
});
