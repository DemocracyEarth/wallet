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
    allowedValues: [ENTITY_INDIVIDUAL, ENTITY_COLLECTIVE, ENTITY_CONTRACT, ENTITY_UNKNOWN],
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('entityType') == undefined) {
          return ENTITY_UNKNOWN;
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
    allowedValues: [CURRENCY_BITCOIN, CURRENCY_SATOSHI, CURRENCY_VOTES],
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('currency') == undefined) {
          return CURRENCY_VOTES;
        }
      }
    }
  }
});

Schema.Transaction = new SimpleSchema({
  input: {
    type: Schema.Ticket
  },
  output: {
    type: Schema.Ticket
  },
  kind: {
    type: String,
    allowedValues: [KIND_VOTE, KIND_DELEGATION, KIND_MEMBERSHIP, KIND_UNKNOWN],
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('kind').value == undefined) {
          return KIND_UNKNOWN;
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
        if (this.field('transferable').value == undefined) {
          return true;
        }
      }
    }
  },
  "condition.portable": {
    type: Boolean,
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('portable').value == undefined) {
          return true;
        }
      }
    }
  },
  "condition.tags": {
    type: Array,
    optional: true
  },
  "condition.tags.$": {
    type: Object,
    optional: true
  },
  status: {
    type: String,
    allowedValues: [STATUS_PENDING, STATUS_REJECTED, STATUS_CONFIRMED],
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('status').value == undefined) {
          return STATUS_PENDING;
        }
      }
    }
  }
});

Transactions.attachSchema(Schema.Transaction);

export default Schema.Transaction;
