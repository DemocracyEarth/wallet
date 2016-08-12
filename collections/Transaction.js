//Transactions = new Mongo.Collection("transactions");

Schema.Transaction = new SimpleSchema({
  userId: {
    type: String,
    optional: true
  },
  action: {
    type: String,
    allowedValues: ['COMMENT', 'VOTE', 'SORT', 'REPLY'],
    autoValue: function () {
      if (this.isInsert) {
        return "COMMENT";
      };
    }
  },
  children: {
    type: Array,
    optional: true
  },
  "children.$": {
      type: Schema.Transaction
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
    allowedValues: ['SIGNALED', 'VERIFIED', 'PROCESSED'],
    autoValue: function () {
      if (this.isInsert) {
        return "SIGNALED";
      };
    }
  }
});

TransactionContext = Schema.Transaction.newContext();
//Transaction.attachSchema(Schema.Transaction);

export default Schema.Transaction;
