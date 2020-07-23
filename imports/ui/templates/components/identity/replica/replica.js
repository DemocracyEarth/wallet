import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';

import { replicaThreshold } from '/lib/const';
import { templetize, getImage } from '/imports/ui/templates/layout/templater';
import { shortenCryptoName } from '/imports/startup/both/modules/metamask';

import '/imports/ui/templates/components/identity/replica/replica.html';
import '/imports/ui/templates/widgets/qr/qr.js';
import '/imports/ui/templates/components/decision/balance/balance.js';

Template.replica.onCreated(function () {
  const instance = Template.instance();
  Template.instance().ready = new ReactiveVar(false);
  Template.instance().imageTemplate = new ReactiveVar();
  Template.instance().score = (instance.data.replica.user.profile.replica && instance.data.replica.user.profile.replica.score) ? instance.data.replica.user.profile.replica.score : undefined;

  templetize(instance);
});

const _getThreshold = (score) => {
  if (score >= replicaThreshold.VERY) {
    return 'VERY';
  } else if (score >= replicaThreshold.LIKELY) {
    return 'LIKELY';
  } else if (score >= replicaThreshold.MAYBE) {
    return 'MAYBE';
  } else if (score >= replicaThreshold.UNLIKELY) {
    return 'UNLIKELY';
  } else if (score >= replicaThreshold.NOT) {
    return 'NOT';
  }
  return 'UNKNOWN';
};

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
    const score = Template.instance().score;
    if (score) {
      return `<strong>${parseInt(score * 100, 10)}</strong>%`;
    }
    return '<strong>?</strong>';
  },
  width() {
    const score = Template.instance().score;
    if (score) {
      return `width: ${parseInt(score * 100, 10)}%;`;
    }
    return 'display:none;';
  },
  detail() {
    return TAPi18n.__(`replica-detail-${_getThreshold(Template.instance().score).toLowerCase()}-human`);
  },
  semaphore() {
    return `replica-semaphore-${_getThreshold(Template.instance().score).toLowerCase()}`;
  },
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
  blockchainLink() {
    return `${Meteor.settings.public.web.sites.blockExplorer}/address/${this.replica.user.username}`;
  },
});
