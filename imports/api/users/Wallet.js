import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { token } from '/lib/token';

import { Ballot } from '../transactions/Ballot';
import { Reserves } from './Reserves';


const Schema = {};

/**
* @summary returns list of all valid coins for this instance
*/
const _coins = () => {
  const coins = [];
  coins.push('VOTES'); // backwards compatibility;
  // coins.push('WEB VOTE'); // for tokenless users
  for (let i = 0; i < token.coin.length; i += 1) {
    coins.push(token.coin[i].code);
    if (token.coin[i].subcode) {
      coins.push(token.coin[i].subcode);
    }
  }
  return coins;
};

Schema.Wallet = new SimpleSchema({
  balance: {
    type: Number,
    defaultValue: 0,
  },
  placed: {
    type: Number,
    defaultValue: 0,
  },
  available: {
    type: Number,
    defaultValue: 0,
  },
  currency: {
    type: String,
    autoValue() {
      if (this.isInsert) {
        if (this.field('wallet') && this.field('wallet').value && !this.field('wallet').value.currency) {
          return 'WEB VOTE';
        }
      }
    },
  },
  reserves: {
    type: [Reserves],
    optional: true,
  },
  address: {
    type: Array,
    autoValue() {
      if (this.isInsert) {
        return [];
      }
    },
  },
  'address.$': {
    type: Object,
    optional: true,
  },
  'address.$.hash': {
    type: String,
    optional: true,
  },
  'address.$.collectiveId': {
    type: String,
    optional: true,
  },
  ledger: {
    type: Array,
    autoValue() {
      if (this.isInsert) {
        return [];
      }
    },
  },
  'ledger.$': {
    type: Object,
    optional: true,
  },
  'ledger.$.txId': {
    type: String,
    optional: true,
  },
  'ledger.$.quantity': {
    type: Number,
    optional: true,
  },
  'ledger.$.entityId': {
    type: String,
    optional: true,
  },
  'ledger.$.entityType': {
    type: String,
    optional: true,
  },
  'ledger.$.currency': {
    type: String,
    optional: true,
    allowedValues: ['BITCOIN', 'SATOSHI', 'VOTES', 'VOTE', 'ETH', 'WEI'],
  },
  'ledger.$.transactionType': {
    type: String,
    allowedValues: ['OUTPUT', 'INPUT'],
  },
  'ledger.$.ballot': {
    type: Array,
    optional: true,
  },
  'ledger.$.ballot.$': {
    type: Ballot,
    optional: true,
  },
});

export const Wallet = Schema.Wallet;
export const coins = _coins;
