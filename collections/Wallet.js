import {default as Transaction} from "./Transactions";

Schema.Wallet =  new SimpleSchema({
  balance: {
    type: Number,
    defaultValue: 0
  },
  placed: {
    type: Number,
    defaultValue: 0
  },
  available: {
    type: Number,
    defaultValue: 0
  },
  currency: {
    type: String,
    allowedValues: ['BITCOIN', 'SATOSHI', 'VOTES'],
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('currency').value == undefined) {
          return 'VOTES';
        }
      }
    }
  },
  address: {
    type: Array,
    optional: true
  },
  "address.$": {
    type: Object,
    optional: true
  },
  "address.$.hash": {
    type: String,
    optional: true
  },
  "address.$.collectiveId": {
    type: String,
    optional: true
  },
  transactions: {
    type: Array,
    autoValue: function () {
      if (this.isInsert) {
        return [];
      }
    }
  },
  "transactions.$": {
    type: Transaction,
    optional: true
  }
});

export default Schema.Wallet;
