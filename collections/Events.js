Events = new Mongo.Collection("events");

Schema.Events = new SimpleSchema({
  contractId: {
    type: String
  },
  userId: {
    type: String,
    optional: true
  },
  eventId: {
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
  sortUp: {
    type: Number,
    autoValue: function () {
      if (this.isInsert) {
        return 0;
      }
    }
  },
  sortDown: {
    type: Number,
    autoValue: function () {
      if (this.isInsert) {
        return 0;
      }
    }
  },
  createdAt: {
    //Creation Date
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      }
    }
  },
  lastUpdate: {
    //Last update
    type: Date,
    autoValue: function () {
      if (this.isUpdate) {
        return new Date();
      }
    }
  },
  timestamp: {
    //Timestamp (visible last update)
    type: Date,
    autoValue: function () {
      return new Date();
    }
  }
});

EventContext = Schema.Events.newContext();
Events.attachSchema(Schema.Events);

export default Schema.Events;
