import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import Ballot from '../transactions/Ballot';

const Schema = {};
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
    allowedValues: ['BITCOIN', 'SATOSHI', 'VOTES'],
    autoValue() {
      if (this.isInsert) {
        if (this.field('currency').value === undefined) {
          return 'VOTES';
        }
      }
    },
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
    allowedValues: ['BITCOIN', 'SATOSHI', 'VOTES'],
  },
  'ledger.$.ballot': {
    type: [Ballot],
    optional: true,
  },
  'ledger.$.direction': {
    type: String,
    allowedValues: ['OUTPUT', 'INPUT'],
    optional: true,
  },
});

export const Wallet = Schema.Wallet;
