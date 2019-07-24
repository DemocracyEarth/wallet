import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Schema = {};

Schema.Coin = new SimpleSchema({
  code: {
    type: String,
    optional: true,
  },
});

Schema.Ticket = new SimpleSchema({
  hash: {
    type: String,
    optional: true,
  },
  status: {
    type: String,
    allowedValues: ['CONFIRMED', 'PENDING', 'FAIL'],
    defaultValue: 'PENDING',
  },
  value: {
    type: String,
    defaultValue: '0',
  },
});

Schema.Score = new SimpleSchema({
  totalConfirmed: {
    type: String,
    defaultValue: '0',
  },
  totalPending: {
    type: String,
    defaultValue: '0',
  },
  totalFail: {
    type: String,
    defaultValue: '0',
  },
  finalConfirmed: {
    type: Number,
    defaultValue: 0,
    decimal: true,
  },
  finalPending: {
    type: Number,
    defaultValue: 0,
    decimal: true,
  },
  finalFail: {
    type: Number,
    defaultValue: 0,
    decimal: true,
  },
  value: {
    type: Number,
    defaultValue: 0,
    decimal: true,
  },
});

Schema.Blockchain = new SimpleSchema({
  publicAddress: {
    type: String,
    defaultValue: '',
    optional: true,
  },
  coin: {
    type: Schema.Coin,
    optional: true,
  },
  tickets: {
    type: [Schema.Ticket],
    defaultValue: [],
    optional: true,
  },
  votePrice: {
    type: String,
    optional: true,
  },
  balance: {
    type: String,
    optional: true,
  },
  score: {
    type: Schema.Score,
    optional: true,
  },
  proof: {
    type: String,
    optional: true,
  },
  contracts: {
    type: Array,
    optional: true,
    defaultValue: [],
  },
  'contracts.$': {
    type: Object,
  },
  'contracts.$.label': {
    type: String,
    optional: true,
  },
  'contracts.$.publicAddress': {
    type: String,
    optional: true,
  },
  'contracts.$.EIP': {
    type: String,
    optional: true,
  },
  'contracts.$.description': {
    type: String,
    optional: true,
  },
  'contracts.$.abi': {
    type: String,
    optional: true,
  },
  address: {
    type: String,
    optional: true,
  },
});

export const Blockchain = Schema.Blockchain;
export const Ticket = Schema.Ticket;
