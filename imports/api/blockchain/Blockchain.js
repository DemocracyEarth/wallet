import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { schemaContract } from '/imports/api/contracts/Contracts';

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

Schema.Map = new SimpleSchema({
  eventName: {
    type: String,
    optional: true,
  },
  collectionType: {
    type: String,
    optional: true,
  },
  contract: {
    type: schemaContract,
    defaultValue: {},
    optional: true,
  },
  script: {
    type: String,
    optional: true,
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
  isDAO: {
    type: Boolean,
    optional: true,
  },
  smartContracts: {
    type: Array,
    optional: true,
    defaultValue: [],
  },
  'smartContracts.$': {
    type: Object,
  },
  'smartContracts.$.label': {
    type: String,
    optional: true,
  },
  'smartContracts.$.publicAddress': {
    type: String,
    optional: true,
  },
  'smartContracts.$.EIP': {
    type: Number,
    optional: true,
  },
  'smartContracts.$.description': {
    type: String,
    optional: true,
  },
  'smartContracts.$.abi': {
    type: String,
    optional: true,
  },
  'smartContracts.$.map': {
    type: [Schema.Map],
    optional: true,
  },
  address: {
    type: String,
    optional: true,
  },
});

export const Blockchain = Schema.Blockchain;
export const Ticket = Schema.Ticket;
