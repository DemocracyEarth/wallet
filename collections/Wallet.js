//NOTE: These schemas of Ticket & Transaction must store transactions in its own db (eventually a blockchain)
Schema.Ticket = new SimpleSchema({
  address: {
    type: String
  },
  entityId: {
    type: String
  },
  entityType: {
    type: String,
    allowedValues: ['INDIVIDUAL', 'COLLECTIVE']
  },
  quantity: {
    type: Number
  },
  currency: {
    type: String,
    allowedValues: ['BITCOIN', 'SATOSHI', 'VOTES'],
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('currency') == undefined) {
          return 'VOTES';
        }
      }
    }
  }
});

Schema.Transaction = new SimpleSchema({
  id: {
    type: String
  },
  input: {
    type: Object,
    optional: true
  },
  "input.$": {
    type: Schema.Ticket,
    optional: true
  },
  output: {
    type: Array,
    optional: true
  },
  "output.$": {
    type: Schema.Ticket,
    optional: true
  },
  timestamp: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      }
    }
  },
  expirationDate: {
    //for placed tokens, once expired reverses the operation
    type: Date,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('expirationDate') == undefined) {
          return 0;
        }
      }
    }
  },
  transferable: {
    type: Boolean,
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('transferable') == undefined) {
          return true;
        }
      }
    }
  }
});

Schema.Wallet =  new SimpleSchema({
  balance: {
    type: Number,
    optional: true
  },
  currency: {
    type: String,
    allowedValues: ['BITCOIN', 'SATOSHI', 'VOTES'],
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('currency') == undefined) {
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
    type: String,
    optional: true
  },
  transactions: {
    type: Array
  },
  "transactions.$": {
    type: Schema.Transaction,
    optional: true
  }
});

export default Schema.Wallet;
