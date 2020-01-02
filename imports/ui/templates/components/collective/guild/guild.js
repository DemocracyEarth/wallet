import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';

import { templetize, getImage } from '/imports/ui/templates/layout/templater';
import { getCoin } from '/imports/api/blockchain/modules/web3Util';

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
  Template.instance().imageTemplate = new ReactiveVar();
  Template.instance().memberCount = new ReactiveVar();

  const instance = Template.instance();
  templetize(instance);

  Meteor.call('getCollectiveById', this.data.collectiveId, (err, res) => {
    if (err) {
      console.log(err);
    }
    instance.ready.set(true);
    instance.collective.set(res);
  });

  Meteor.call('userCount', function (error, result) {
    instance.memberCount.set(result);
  });
});

const _getRow = (rowLabel, instance) => {
  const balance = standardBalance;
  const row = _.findWhere(instance.collective.get().profile.guild, { name: rowLabel });
  balance.token = row.type.replace('token.', '');
  balance.balance = row.value.toNumber();
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
    const row = _getRow('guild-total-value', Template.instance());
    row.whiteColor = true;
    return row;
  },
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
  members() {
    const count = Template.instance().memberCount.get();
    if (count === 1) {
      return `${count} ${TAPi18n.__('member')}`;
    }
    return `${count} ${TAPi18n.__('members')}`;
  },
  totalStyle() {
    const coin = getCoin(Template.instance().collective.get().profile.blockchain.coin.code);
    return `background-color: ${coin.color}`;
  },
  titleColor() {
    const coin = getCoin(Template.instance().collective.get().profile.blockchain.coin.code);
    return `color: ${coin.color}`;
  },
  publicAddress() {
    const publicAddress = Template.instance().collective.get().profile.blockchain.publicAddress;
    return `${publicAddress.substring(0, 6)}...${publicAddress.slice(-4)}`;
  },
  blockchainLink() {
    return `${Meteor.settings.public.web.sites.blockExplorer}/address/${Template.instance().collective.get().profile.blockchain.publicAddress}`;
  },
});
