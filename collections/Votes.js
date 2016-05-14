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
  userId: {
    type: String
  },
  votes: {
    type: Object
  },
  "votes.placed": {
    type: Number,
    defaultValue: 0
  },
  "votes.available": {
    type: Number,
    defaultValue: 0
  },
  "votes.total": {
    type: Number,
    defaultValue: 0
  },
  delegations: {
    type: Schema.Delegations,
    optional: true
  }
});

Votes.attachSchema(Schema.Votes);
