import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { coins } from '/imports/api/users/Wallet';

const Schema = {};

Schema.Coin = new SimpleSchema({
  code: {
    type: String,
    allowedValues: coins(),
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

Schema.Blockchain = new SimpleSchema({
  publicAddress: {
    type: String,
    defaultValue: '',
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
});

export const Blockchain = Schema.Blockchain;
