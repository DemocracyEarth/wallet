import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Schema = {};
Schema.Reserves = new SimpleSchema({
  publicAddress: {
    type: String,
  },
  token: {
    type: String,
    defaultValue: ['WEI'],
  },
  balance: {
    type: Number,
    defaultValue: 0,
    decimal: true,
  },
  placed: {
    type: Number,
    defaultValue: 0,
    decimal: true,
  },
  available: {
    type: Number,
    defaultValue: 0,
    decimal: true,
  },
});

export const Reserves = Schema.Reserves;
