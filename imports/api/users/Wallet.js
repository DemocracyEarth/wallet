import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { token } from '/lib/token';

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

Schema.Ledger = new SimpleSchema({
  collectiveId: {
    type: String,
    optional: true,
  },
  txId: {
    type: String,
    optional: true,
  },
  token: {
    type: String,
    optional: true,
  },
  value: {
    type: Number,
    optional: true,
    decimal: true,
  },
  timestamp: {
    type: Date,
    optional: true,
  },
});

Schema.Wallet = new SimpleSchema({
  balance: {
    type: Number,
    defaultValue: 0,
    optional: true,
  },
  placed: {
    type: Number,
    defaultValue: 0,
    optional: true,
  },
  available: {
    type: Number,
    defaultValue: 0,
    optional: true,
  },
  currency: {
    type: String,
    optional: true,
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
    optional: true,
  },
  'address.$': {
    type: Object,
    optional: true,
  },
  'address.$.hash': {
    type: String,
    optional: true,
  },
  'address.$.chain': {
    type: String,
    optional: true,
  },
  'address.$.collectiveId': {
    type: String,
    optional: true,
  },
  ledger: {
    type: [Schema.Ledger],
    optional: true,
  },
});

export const Wallet = Schema.Wallet;
export const coins = _coins;
