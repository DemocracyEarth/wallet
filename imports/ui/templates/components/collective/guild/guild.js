import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Collectives } from '/imports/api/collectives/Collectives';
import { ReactiveVar } from 'meteor/reactive-var';

import '/imports/ui/templates/components/collective/guild/guild.html';
import '/imports/ui/templates/components/decision/balance/balance.js';

const standardBalance = {
  token: 'MOLOCH',
  balance: 0,
  available: 0,
  placed: 0,
  isTransaction: true,
  isRevoke: false,
  date: new Date(),
  disableBar: true,
  disableStake: true,
  value: 100,
};


Template.guild.onCreated(function () {
  Template.instance().collective = new ReactiveVar();
  Template.instance().ready = new ReactiveVar(false);
  const instance = Template.instance();

  Meteor.call('getCollectiveById', this.data.collectiveId, (err, res) => {
    if (err) {
      console.log(err);
    }
    instance.ready.set(true);
    instance.collective.set(res);
  });
});

const _getRow = (rowLabel, instance) => {
  const balance = standardBalance;
  const row = _.findWhere(instance.collective.get().profile.guild, { name: rowLabel });
  balance.token = row.type.replace('token.', '');
  balance.balance = row.value.toNumber();
  console.log(balance);
  return balance;
};

Template.guild.helpers({
  ready() {
    return Template.instance().ready.get();
  },
  name() {
    return Template.instance().collective.get().name;
  },
  url() {
    return Template.instance().collective.get().profile.website;
  },
  icon() {
    return Template.instance().collective.get().profile.logo;
  },
  totalShares() {
    return _getRow('guild-total-shares', Template.instance());
  },
  totalAssets() {
    return _getRow('guild-total-assets', Template.instance());
  },
  shareValue() {
    return _getRow('guild-share-value', Template.instance());
  },
  totalValue() {
    return _getRow('guild-total-value', Template.instance());
  },
});
