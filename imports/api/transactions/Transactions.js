import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Ballot } from './Ballot';

export const Transactions = new Mongo.Collection('transactions');

/* NOTE: These schemas of Ticket & Transaction must store transactions in its own db.
*  (eventually a blockchain via vote-microchain TBD)
*/
const Schema = {};
Schema.Ticket = new SimpleSchema({
  entityId: {
    type: String
  },
  address: {
    type: String
  },
  entityType: {
    type: String,
    allowedValues: ['INDIVIDUAL', 'COLLECTIVE', 'CONTRACT', 'UNKNOWN'],
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
    type: Schema.Ticket,
  },
  output: {
    type: Schema.Ticket,
  },
  kind: {
    type: String,
    allowedValues: ['VOTE', 'DELEGATION', 'MEMBERSHIP', 'UNKNOWN'],
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('kind').value == undefined) {
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
    // for placed tokens, once expired reverses the operation
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
  "condition.ballot": {
    type: [Ballot],
    optional: true
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
    allowedValues: ['PENDING', 'REJECTED', 'CONFIRMED'],
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('status').value == undefined) {
          return 'PENDING';
        }
      }
    }
  }
});

Transactions.attachSchema(Schema.Transaction);

/*
*  FIX: temporary workaround
*  TBD: apply security best practices
*  All to methods, validate paramenters
*/

Transactions.allow({
  insert: function () {
    if (Meteor.userId()) {
      return true;
    }
  },
  update: function () {
    if (Meteor.userId()) {
      return true;
    }
  },
  remove: function () {
    if (Meteor.userId()) {
      return true;
    }
  },  
});
