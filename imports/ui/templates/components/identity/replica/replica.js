import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { templetize, getImage } from '/imports/ui/templates/layout/templater';
import { shortenCryptoName } from '/imports/ui/templates/components/identity/avatar/avatar';

import '/imports/ui/templates/components/identity/replica/replica.html';
import '/imports/ui/templates/widgets/qr/qr.js';
import '/imports/ui/templates/components/decision/balance/balance.js';

Template.replica.onCreated(function () {
  Template.instance().ready = new ReactiveVar(false);
  Template.instance().imageTemplate = new ReactiveVar();

  const instance = Template.instance();
  templetize(instance);
});

Template.replica.helpers({
  name() {
    return shortenCryptoName(this.replica.user.username);
  },
  url() {
    return `/address/${this.replica.user.username}`;
  },
  publicAddress() {
    return this.replica.user.username;
  },
  score() {
    return '76%';
  },
  detail() {
    return '🐵 very likely a human';
  },
  semaphore() {
    return 'replica-positive';
  },
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
  blockchainLink() {
    return `${Meteor.settings.public.web.sites.blockExplorer}/address/${this.replica.user.username}`;
  },
});
