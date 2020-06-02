import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Tokens = new Mongo.Collection('tokens');

const Schema = {};

Schema.Token = new SimpleSchema({
  code: {
    type: String,
    optional: true,
  },
  format: {
    type: String,
    optional: true,
  },
  emoji: {
    type: String,
    optional: true,
  },
  unicode: {
    type: String,
    optional: true,
  },
  name: {
    type: String,
    optional: true,
  },
  maxSupply: {
    type: Number,
    optional: true,
  },
  supply: {
    type: Number,
    optional: true,
  },
  decimals: {
    type: Number,
    optional: true,
  },
  inflationary: {
    type: Boolean,
    optional: true,
  },
  title: {
    type: String,
    optional: true,
  },
  color: {
    type: String,
    optional: true,
  },
  type: {
    type: String,
    optional: true,
  },
  blockchain: {
    type: String,
    optional: true,
  },
  contractAddress: {
    type: String,
    optional: true,
  },
  defaultVote: {
    type: String,
    optional: true,
  },
  oracle: {
    type: Boolean,
    optional: true,
  },
  oracleABI: {
    type: String,
    optional: true,
  },
  oracleAddress: {
    type: String,
    optional: true,
  },
  oracleMethod: {
    type: String,
    optional: true,
  },
  method: {
    type: String,
    optional: true,
  },
  abi: {
    type: String,
    optional: true,
  },
  editor: {
    type: Object,
    optional: true,
  },
  'editor.allowBalanceToggle': {
    type: Boolean,
    optional: true,
  },
  'editor.allowBlockchainAddress': {
    type: Boolean,
    optional: true,
  },
  'editor.allowQuadraticToggle': {
    type: Boolean,
    optional: true,
  },
});


Tokens.attachSchema(Schema.Token);

Tokens.allow({
  insert(userId) {
    if (userId) {
      return true;
    }
    return false;
  },
  update(userId) {
    if (userId) {
      return true;
    }
    return false;
  },
  remove(userId) {
    if (userId) {
      return true;
    }
    return false;
  },
});

export const Token = Schema.Token;
