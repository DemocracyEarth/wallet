import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { guidGenerator } from '../../startup/both/modules/crypto';

const Schema = {};
Schema.Thread = new SimpleSchema({
  id: {
    type: String,
    autoValue: function () {
      return guidGenerator();
    }
  },
  userId: {
    type: String,
    optional: true
  },
  action: {
    type: String,
    allowedValues: ['COMMENT', 'VOTE', 'SORT', 'REPLY'],
    autoValue: function () {
      if (this.isInsert) {
        return 'COMMENT';
      };
    }
  },
  children: {
    type: Array,
    autoValue: function () {
      if (this.isInsert || this.isUpdate) {
        return [];
      }
    }
  },
  'children.$': {
    type: Object,
    blackbox: true,
  },
  ballot: {
    type: Array,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return [];
      }
    }
  },
  "ballot.$": {
      type: Object
  },
  "ballot.$._id": {
    type: String
  },
  "ballot.$.mode": {
    type: String
  },
  "ballot.$.rank": {
    type: Number
  },
  "ballot.$.url": {
    type: String,
    optional: true
  },
  "ballot.$.label": {
    type: String,
    optional: true
  },
  placedVotes: {
    type: Number,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return 0;
      }
    }
  },
  hasQuote: {
    type: Boolean,
    optional: true
  },
  quote: {
    type: String,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return '';
      }
    }
  },
  content: {
    type: String,
    autoValue: function () {
      if (this.isInsert) {
        return '';
      }
    }
  },
  sort: {
    type: Array,
    optional: true
  },
  "sort.$": {
    type: Object,
    optional: true
  },
  "sort.$.upvotes": {
    type: Number
  },
  "sort.$.downvotes": {
    type: Number
  },
  "sort.$.userId": {
    type: String
  },
  sortTotal: {
    type: Number,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return 0;
      }
    }
  },
  timestamp: {
    type: Date,
    autoValue: function () {
      return new Date();
    }
  },
  status: {
    type: String,
    allowedValues: ['NEW', 'VERIFIED', 'PROCESSED'],
    autoValue: function () {
      return 'NEW';
    }
  }
});

export const ThreadContext = Schema.Thread.newContext();
export const Thread = Schema.Thread;
