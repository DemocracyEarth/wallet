import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { TAPi18n } from 'meteor/tap:i18n';

import { Ballot } from '/imports/api/transactions/Ballot';
import { convertToSlug } from '/lib/utils';
import { Thread } from '/imports/api/contracts/Thread';
import { Wallet } from '/imports/api/users/Wallet';
import { Blockchain } from '/imports/api/blockchain/Blockchain';

export const Contracts = new Mongo.Collection('contracts');

const Schema = {};

Schema.Tally = new SimpleSchema({
  lastTransaction: {
    type: String,
    defaultValue: '',
  },
  choice: {
    type: Array,
    defaultValue: [],
  },
  'choice.$': {
    type: Object,
    optional: true,
  },
  'choice.$.ballot': {
    type: [Ballot],
    optional: true,
  },
  'choice.$.votes': {
    type: Number,
    defaultValue: 0,
  },
  'choice.$.winner': {
    type: Boolean,
    optional: true,
  },
  voter: {
    type: Array,
    defaultValue: [],
  },
  'voter.$': {
    type: Object,
  },
  'voter.$._id': {
    type: String,
  },
  'voter.$.votes': {
    type: Number,
  },
  'voter.$.ballotList': {
    type: [String],
  },
});

Schema.Constituency = new SimpleSchema({
  kind: {
    type: String,
    allowedValues: ['TOKEN', 'NATION', 'DOMAIN'],
    optional: true,
  },
  code: {
    type: String,
    optional: true,
  },
  check: {
    type: String,
    allowedValues: ['EQUAL', 'NOT EQUAL'],
    optional: true,
  },
});

Schema.Contract = new SimpleSchema({
  owner: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  collectiveId: {
    type: String,
    optional: true,
    autoValue() {
      if (this.isInsert) {
        if (Meteor.settings.public.Collective) {
          return Meteor.settings.public.Collective._id;
        }
      }
    },
  },
  title: {
    // title of the contract
    type: String,
    defaultValue: '',
  },
  keyword: {
    // unique string identifier in db as keyword-based-slug
    type: String,
    autoValue() {
      const slug = convertToSlug(this.field('title').value);
      if (this.isInsert) {
        if (this.field('kind').value === 'DELEGATION') {
          return this.field('keyword').value;
        }
        if (this.field('keyword').value === undefined) {
          if (this.field('title').value !== undefined) {
            if (Contracts.findOne({ keyword: slug }) === undefined) {
              if (this.field('title').value !== '') {
                return slug;
              }
              return `draft-${this.field('owner').value}`;
            }
          }
          return `draft-${this.field('owner').value}`;
        }
      }
    },
  },
  kind: {
    // kind of contract
    type: String,
    allowedValues: ['DRAFT', 'VOTE', 'DELEGATION', 'MEMBERSHIP', 'DISCIPLINE'],
    autoValue() {
      if (this.isInsert) {
        if (this.field('kind').value === undefined) {
          return 'VOTE';
        }
      }
    },
  },
  context: {
    // context this contract lives on the system
    type: String,
    allowedValues: ['GLOBAL', 'LOCAL'],
    autoValue() {
      if (this.isInsert) {
        return 'GLOBAL';
      }
    },
  },
  url: {
     // URL inside the instance of .Earth
    type: String,
    autoValue() {
      const slug = convertToSlug(this.field('title').value);
      if (this.isInsert) {
        if (this.field('kind').value === 'DELEGATION') {
          if (this.field('keyword').value !== undefined) {
            return `/delegation/${this.field('keyword').value}`;
          }
          return 'delegation';
        }
        if (this.field('title').value !== undefined) {
          if (Contracts.findOne({ keyword: slug }) === undefined) {
            if (this.field('title').value !== '') {
              return `/vote/${slug}`;
            }
            return '/vote/';
          }
        }
        return '/vote/';
      }
    },
  },
  description: {
    // HTML Description of the contract (the contents of the contract itself)
    type: String,
    autoValue() {
      if (this.isInsert) {
        if (this.field('kind').value === 'DELEGATION') {
          if (this.field('description').value === undefined) {
            return TAPi18n.__('default-delegation-contract');
          }
        } else {
          return '';
        }
      }
    },
  },
  createdAt: {
    // creation Date
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      }
    },
  },
  lastUpdate: {
    // last update
    type: Date,
    autoValue() {
      return new Date();
    },
  },
  timestamp: {
    // timestamp (visible last update)
    type: Date,
    autoValue() {
      if (this.isUpdate || this.isInsert) {
        return new Date();
      }
    },
  },
  tags: {
    // collection of Tags semantically describing contract
    type: Array,
    autoValue() {
      if (this.isInsert) {
        return [];
      }
    },
  },
  'tags.$': {
    type: Object,
    optional: true,
  },
  'tags.$._id': {
    type: String,
    optional: true,
  },
  'tags.$.label': {
    type: String,
    optional: true,
  },
  'tags.$.url': {
    type: String,
    optional: true,
  },
  'tags.$.rank': {
    type: Number,
    optional: true,
  },
  membersOnly: {
    // visible to members of the organization
    type: Boolean,
    autoValue() {
      if (this.isInsert) {
        return false;
      }
    },
  },
  permanentElection: {
    type: Boolean,
    defaultValue: true,
  },
  executionStatus: {
    // execution status: DRAFT, APPROVED, ALTERNATIVE, REJECTED
    type: String,
    allowedValues: ['OPEN', 'APPROVED', 'ALTERNATIVE', 'REJECTED', 'VOID'],
    autoValue() {
      if (this.isInsert) {
        return 'OPEN';
      }
    },
  },
  anonymous: {
    // anonymous contract
    type: Boolean,
    autoValue() {
      if (this.isInsert) {
        return false;
      }
    },
  },
  signatures: {
    // collection of authors that signed this contract
    type: Array,
    defaultValue: [],
  },
  'signatures.$': {
    type: Object,
  },
  'signatures.$._id': {
    type: String,
  },
  'signatures.$.username': {
    type: String,
    optional: true,
  },
  'signatures.$.role': {
    type: String,
    allowedValues: ['AUTHOR', 'DELEGATOR', 'DELEGATE', 'ENDORSER'],
    optional: true,
  },
  'signatures.$.status': {
    type: String,
    allowedValues: ['PENDING', 'REJECTED', 'CONFIRMED'],
    optional: true,
  },
  'signatures.$.hash': {
    type: String,
    optional: true,
  },
  closingDate: {
    // when the contract decision closes (poll closing)
    type: Date,
    autoValue() {
      if (this.isInsert) {
        const creationDate = new Date();
        creationDate.setDate(creationDate.getDate() + 1);
        return creationDate;
      }
    },
  },
  alwaysOpen: {
    // if contract never closes and is always open
    type: Boolean,
    autoValue() {
      if (this.isInsert) {
        return false;
      }
    },
  },
  allowForks: {
    // if adding as an option other contracts is possible
    type: Boolean,
    autoValue() {
      if (this.isInsert) {
        return false;
      }
    },
  },
  secretVotes: {
    // if votes will be strictly kept secret
    type: Boolean,
    autoValue() {
      if (this.isInsert) {
        return false;
      }
    },
  },
  realtimeResults: {
    // if results of the election are shown on real-time
    type: Boolean,
    autoValue() {
      if (this.isInsert) {
        return false;
      }
    },
  },
  multipleChoice: {
    // if selection of multiple options on ballot is allowed
    type: Boolean,
    defaultValue: false,
  },
  rankPreferences: {
    // if Ballot dynamic is based on ranking preferences
    type: Boolean,
    defaultValue: false,
  },
  executiveDecision: {
    // if contract includes options of final decisoin (AUTHORIZE & REJECT)
    type: Boolean,
    defaultValue: true,
  },
  stage: {
    // current stage of this contract: DRAFT, LIVE, FINISH
    type: String,
    allowedValues: ['DRAFT', 'LIVE', 'FINISH'],
    defaultValue: 'DRAFT',
  },
  transferable: {
    type: Boolean,
    optional: true,
    autoValue() {
      if (this.isInsert) {
        if (this.field('kind').value === 'DELEGATION') {
          return true;
        }
      }
    },
  },
  limited: {
    type: Boolean,
    optional: true,
    autoValue() {
      if (this.isInsert) {
        if (this.field('kind').value === 'DELEGATION') {
          return false;
        }
      }
    },
  },
  portable: {
    type: Boolean,
    optional: true,
    autoValue() {
      if (this.isInsert) {
        if (this.field('kind').value === 'DELEGATION') {
          return false;
        }
      }
    },
  },
  ballot: {
    // ballot options of the contract
    type: Array,
    autoValue() {
      if (this.isInsert) {
        return [];
      }
    },
  },
  'ballot.$': {
    type: Object,
  },
  'ballot.$._id': {
    type: String,
  },
  'ballot.$.mode': {
    type: String,
  },
  'ballot.$.rank': {
    type: Number,
    optional: true,
  },
  'ballot.$.tick': {
    type: Boolean,
    optional: true,
  },
  'ballot.$.executive': {
    type: Boolean,
    optional: true,
  },
  'ballot.$.url': {
    type: String,
    optional: true,
  },
  ballotEnabled: {
    type: Boolean,
    defaultValue: false,
  },
  'ballot.$.label': {
    type: String,
    optional: true,
  },
  stakingEnabled: {
    type: Boolean,
    defaultValue: false,
  },
  constituencyEnabled: {
    type: Boolean,
    defaultValue: false,
  },
  constituency: {
    type: [Schema.Constituency],
    defaultValue: [],
  },
  authorized: {
    // this contract has been authorized
    type: Boolean,
    defaultValue: false,
  },
  isDefined: {
    // this contract has a definition/description
    type: Boolean,
    defaultValue: false,
  },
  isRoot: {
    // this contract is core to the organization (Constitutional)
    type: Boolean,
    defaultValue: true,
  },
  referrers: {
    // other contracts referring to this one
    type: Array,
    optional: true,
  },
  'referrers.$': {
    type: Object,
  },
  events: {
    type: Array,
    defaultValue: [],
  },
  'events.$': {
    type: Thread,
    optional: true,
  },
  wallet: {
    type: Wallet,
    optional: true,
  },
  tally: {
    type: Schema.Tally,
  },
  replyId: {
    type: String,
    optional: true,
  },
  totalReplies: {
    type: Number,
    optional: true,
  },
  geo: {
    type: String,
    optional: true,
  },
  blockchain: {
    type: Blockchain,
    optional: true,
  },
});

Contracts.attachSchema(Schema.Contract);

export const schemaContract = Schema.Contract;
/*
*  FIX: temporary workaround
*  TBD: apply security best practices
*  All to methods, validate parameters
*/
Contracts.allow({
  insert(userId) {
    if (userId) {
      return true;
    }
    return false;
  },
  update(userId) {
    if (userId) {
      return true;
    }
    return false;
  },
  remove(userId) {
    if (userId) {
      return true;
    }
    return false;
  },
});
