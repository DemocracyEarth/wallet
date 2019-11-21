import { SimpleSchema } from 'meteor/aldeed:simple-schema';
// import { schemaContract } from '/imports/api/contracts/Contracts';

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
    optional: true,
  },
  value: {
    type: String,
    defaultValue: '0',
    optional: true,
  },
});

Schema.Score = new SimpleSchema({
  totalConfirmed: {
    type: String,
    defaultValue: '0',
    optional: true,
  },
  totalPending: {
    type: String,
    defaultValue: '0',
    optional: true,
  },
  totalFail: {
    type: String,
    defaultValue: '0',
    optional: true,
  },
  finalConfirmed: {
    type: Number,
    defaultValue: 0,
    decimal: true,
    optional: true,
  },
  finalPending: {
    type: Number,
    defaultValue: 0,
    decimal: true,
    optional: true,
  },
  finalFail: {
    type: Number,
    defaultValue: 0,
    decimal: true,
    optional: true,
  },
  value: {
    type: Number,
    defaultValue: 0,
    decimal: true,
    optional: true,
  },
});

Schema.ContractMap = new SimpleSchema({
  title: {
    type: String,
    optional: true,
  },
  rules: {
    type: Object,
    optional: true,
  },
  'rules.alwaysOn': {
    type: Boolean,
    optional: true,
  },
  'rules.quadraticVoting': {
    type: Boolean,
    optional: true,
  },
  'rules.balanceVoting': {
    type: Boolean,
    optional: true,
  },
  'rules.pollVoting': {
    type: Boolean,
    optional: true,
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
    type: Schema.ContractMap,
    optional: true,
  },
  script: {
    type: String,
    optional: true,
  },
});

Schema.Parameter = new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },
  type: {
    type: String,
    optional: true,
  },
  value: {
    type: String,
    optional: true,
  },
  length: {
    type: String,
    optional: true,
  },
});

Schema.Blockchain = new SimpleSchema({
  publicAddress: {
    type: String,
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
    optional: true,
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
  'smartContracts.$.parameter': {
    type: [Schema.Parameter],
    optional: true,
  },
  address: {
    type: String,
    optional: true,
  },
});

export const Blockchain = Schema.Blockchain;
export const Ticket = Schema.Ticket;
export const Score = Schema.Score;
export const Coin = Schema.Coin;
