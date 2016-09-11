Transactions = new Mongo.Collection("transactions");

//NOTE: These schemas of Ticket & Transaction must store transactions in its own db (eventually a blockchain via vote-microchain TBD)
Schema.Ticket = new SimpleSchema({
  entityId: {
    type: String
  },
  address: {
    type: String
  },
  entityType: {
    type: String,
    allowedValues: ['INDIVIDUAL', 'COLLECTIVE', 'UNKNOWN'],
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('entityType') == undefined) {
          return 'UNKNOWN';
        }
      }
    }
  },
  quantity: {
    type: Number,
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('quantity') == undefined) {
          return 0;
        }
      }
    }
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
  input: {
    type: Object,
    optional: true
  },
  "input.$": {
    type: Schema.Ticket,
    optional: true
  },
  output: {
    type: Object,
    optional: true
  },
  "output.$": {
    type: Schema.Ticket,
    optional: true
  },
  kind: {
    type: String,
    allowedValues: ['VOTE', 'DELEGATION', 'MEMBERSHIP', 'UNKNOWN'],
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('kind') == undefined) {
          return 'UNKNOWN';
        }
      }
    }
  },
  contractId: {
    type: String,
    optional: true
  },
  timestamp: {
    type: Date,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      }
    }
  },
  condition: {
    type: Object,
    optional: true
  },
  "condition.expiration": {
    //for placed tokens, once expired reverses the operation
    type: Date,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('expiration') == undefined) {
          return 0;
        }
      }
    }
  },
  "condition.transferable": {
    type: Boolean,
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('transferable') == undefined) {
          return true;
        }
      }
    }
  },
  status: {
    type: String,
    allowedValues: ['PENDING', 'REJECTED', 'CONFIRMED'],
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('status') == undefined) {
          return 'CONFIRMED';
        }
      }
    }
  }
});

Schema.Wallet =  new SimpleSchema({
  balance: {
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
    type: Schema.Transaction,
    optional: true
  }
});

export default Schema.Wallet;
