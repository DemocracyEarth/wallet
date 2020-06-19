import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Schema = {};
Schema.Reserves = new SimpleSchema({
  collectiveId: {
    type: String,
    optional: true,
  },
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
  membership: {
    type: String,
    allowedValues: ['APPLICANT', 'MEMBER', 'DELEGATE', 'KICKED', 'VIEWER'],
    optional: true,
  },
  memberSince: {
    type: Date,
    optional: true,
  },
});

export const Reserves = Schema.Reserves;
