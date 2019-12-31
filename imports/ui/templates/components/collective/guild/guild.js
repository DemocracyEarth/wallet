import { Template } from 'meteor/templating';

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

Template.guild.helpers({
  totalShares() {
    return standardBalance;
  },
  totalAssets() {
    return standardBalance;
  },
  shareValue() {
    return standardBalance;
  },
  totalValue() {
    return standardBalance;
  },
});
