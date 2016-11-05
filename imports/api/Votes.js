import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Votes = new Mongo.Collection('votes');

const DelegationContract = new SimpleSchema({
  collectiveId: {
    type: String,
    optional: true
  },
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

const Delegations = new SimpleSchema({
  received: {
    type: Array,
    optional: true
  },
  "received.$": {
    type: DelegationContract.schema,
    optional: true
  },
  sent: {
    type: Array,
    optional: true
  },
  "sent.$": {
    type: DelegationContract.schema,
    optional: true
  }
});

Votes.schema = new SimpleSchema({
  total: {
    type: Number,
    defaultValue: 0
  },
  delegations: {
    type: Schema.Delegations,
    optional: true
  },
  wallet: {
    type: Schema.Wallet,
    optional: true
  }
});

export const VoteContext = Votes.newContext();
export default Votes;
