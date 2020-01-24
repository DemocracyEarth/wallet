import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';

import { templetize, getImage } from '/imports/ui/templates/layout/templater';
import { getCoin } from '/imports/api/blockchain/modules/web3Util';

import '/imports/ui/templates/components/identity/replica/replica.html';
import '/imports/ui/templates/components/decision/balance/balance.js';
import '/imports/ui/templates/components/identity/avatar/avatar.js';

Template.replica.onCreated(function () {
  Template.instance().ready = new ReactiveVar(false);
  Template.instance().imageTemplate = new ReactiveVar();

  const instance = Template.instance();
  templetize(instance);
});

Template.replica.helpers({
  name() {
    return this.replica.user.username;
  },
  url() {
    return this.replica.user.username;
  },
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
});
