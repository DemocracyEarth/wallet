Votes = new Mongo.Collection("votes");

Schema.DelegationContract = new SimpleSchema({
  delegatorId: {
    type: String,
    optional: true
  },
  contractId: {
    type: String,
    optional: true
  },
  votes: {
    type: Number,
    optional: true
  },
  tags: {
    type: Array,
    optional: true
  },
  "tags.$": {
    type: Object,
    optional: true
  },
  "tags.$._id": {
    type: String,
    optional: true
  },
  "tags.$.text": {
    type: String,
    optional: true
  }
});

Schema.Delegations = new SimpleSchema({
  received: {
    type: Array,
    optional: true
  },
  "received.$": {
    type: Schema.DelegationContract,
    optional: true
  },
  sent: {
    type: Array,
    optional: true
  },
  "sent.$": {
    type: Schema.DelegationContract,
    optional: true
  }
});

Schema.Votes = new SimpleSchema({
  total: {
    type: Number,
    autoValue: function () {
      if (this.isInsert) {
        return 0;
      }
    }
  },
  delegations: {
    type: Schema.Delegations,
    optional: true
  },
  budget: {
    type: Schema.Budget,
    optional: true
  }
});

Votes.attachSchema(Schema.Votes);
