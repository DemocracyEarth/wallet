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
    allowedValues: [CURRENCY_BITCOIN, CURRENCY_SATOSHI, CURRENCY_VOTES],
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('currency').value == undefined) {
          return CURRENCY_VOTES;
        }
      }
    }
  },
  address: {
    type: Array,
    autoValue: function () {
      if (this.isInsert) {
        return [];
      }
    }
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
  ledger: {
    type: Array,
    autoValue: function () {
      if (this.isInsert) {
        return [];
      }
    }
  },
  "ledger.$": {
    type: Object,
    optional: true
  },
  "ledger.$.txId": {
    type: String,
    optional: true
  },
  "ledger.$.quantity": {
    type: Number,
    optional: true
  },
  "ledger.$.entityId": {
    type: String,
    optional: true
  },
  "ledger.$.entityType": {
    type: String,
    optional: true
  },
  "ledger.$.currency": {
    type: String,
    optional: true,
    allowedValues: [CURRENCY_BITCOIN, CURRENCY_SATOSHI, CURRENCY_VOTES]
  }
});

export default Schema.Wallet;
