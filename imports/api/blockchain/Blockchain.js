import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Schema = {};

Schema.Coin = new SimpleSchema({
  code: {
    type: String,
    optional: true,
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
});

export const Blockchain = Schema.Blockchain;
