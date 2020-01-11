import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';

import { templetize, getImage } from '/imports/ui/templates/layout/templater';
import { getCoin } from '/imports/api/blockchain/modules/web3Util';

const Chart = require('chart.js');

import '/imports/ui/templates/components/collective/guild/guild.html';
import '/imports/ui/templates/components/decision/balance/balance.js';


const standardBalance = {
  token: 'MOLOCH',
  balance: 0,
  available: 0,
  placed: 0,
  tokenTotal: false,
  isTransaction: true,
  isRevoke: false,
  date: new Date(),
  disableBar: true,
  disableStake: true,
  value: 100,
};

const _setupChart = (collectiveId) => {
  console.log('setupChart()');
  const ctx = $(`#collectiveChart-${collectiveId}`); // document.getElementById(`collectiveChart-${collectiveId}`);
  console.log(`collectiveChart-${collectiveId}`);
  console.log(ctx);
  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      }],
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
          },
        }],
      },
    },
  });
};

Template.chart.onRendered(function () {
  _setupChart(Template.instance().data.collectiveId);
});

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
    const row = _getRow('guild-total-shares', Template.instance());
    row.tokenTotal = false;
    return row;
  },
  totalAssets() {
    const row = _getRow('guild-total-assets', Template.instance());
    row.tokenTotal = false;
    return _getRow('guild-total-assets', Template.instance());
  },
  shareValue() {
    const row = _getRow('guild-share-value', Template.instance());
    row.tokenTotal = false;
    return _getRow('guild-share-value', Template.instance());
  },
  totalValue() {
    const row = _getRow('guild-total-value', Template.instance());
    row.tokenTotal = true;
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
  guildChart() {
    return { collectiveId: this.collectiveId };
  },
});
