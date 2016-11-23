import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { TAPi18n } from 'meteor/tap:i18n';

import { convertToSlug } from '/lib/utils';
import { Thread } from './Thread';
import { Wallet } from '../users/Wallet';


export const Contracts = new Mongo.Collection('contracts');

const Schema = {};
Schema.Contract = new SimpleSchema({
  owner: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  collectiveId: {
    type: String,
    optional: true,
    autoValue: function () {
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
    defaultValue: ''
  },
  keyword: {
    // unique string identifier in db as keyword-based-slug
    type: String,
    autoValue: function () {
      var slug = convertToSlug(this.field("title").value);
      if (this.isInsert) {
        if (this.field('kind').value === 'DELEGATION') {
          return this.field('keyword').value;
        } else {
          if (this.field('keyword').value == undefined) {
            if (this.field("title").value != undefined) {
              if (Contracts.findOne({keyword: slug}) == undefined) {
                if (this.field("title").value != '') {
                  return slug;
                } else {
                  return 'draft-' + this.field('owner').value;
                }
              }
            } else {
              return 'draft-' + this.field('owner').value;
            }
          }
        };
      }
    }
  },
  kind: {
    //Kind of contract
    type: String,
    allowedValues: ['DRAFT', 'VOTE', 'DELEGATION', 'MEMBERSHIP'],
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('kind').value === undefined) {
          return 'VOTE';
        }
      };
    }
  },
  context: {
    //Context this contract lives on the system
    type: String,
    allowedValues: ['GLOBAL', 'LOCAL'],
    autoValue: function () {
      if (this.isInsert) {
        return 'GLOBAL';
      };
    }
  },
  url:  {
     //URL inside the instance of .Earth
    type: String,
    autoValue: function () {
      var slug = convertToSlug(this.field("title").value);
      if (this.isInsert) {
        if (this.field('kind').value == 'DELEGATION') {
          if (this.field('keyword').value != undefined) {
            return '/delegation/' + this.field('keyword').value;
          } else {
            return 'delegation';
          }
        } else {
          if (this.field("title").value != undefined) {
            if (Contracts.findOne({keyword: slug}) == undefined) {
              if (this.field("title").value != '') {
                return '/vote/' + slug;
              } else {
                return '/vote/';
              }
            }
          } else {
            return '/vote/';
          }
        }
      }
    }
  },
  description:  {
    //HTML Description of the contract (the contents of the contract itself)
    type: String,
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('kind').value === 'DELEGATION') {
          if (this.field('description').value === undefined) {
            return TAPi18n.__('default-delegation-contract');
          }
        } else {
          return '';
        }
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
      return new Date();
    }
  },
  timestamp: {
    //Timestamp (visible last update)
    type: Date,
    autoValue: function () {
      if (this.isUpdate || this.isInsert) {
        return new Date();
      }
    }
  },
  tags: {
    //Collection of Tags semantically describing contract
    type: Array,
    autoValue: function () {
      if (this.isInsert) {
        return [];
      }
    }
  },
  "tags.$": {
    type: Object,
    optional: true
  },
  "tags.$._id": {
    type: String,
    optional: true
  },
  "tags.$.label": {
    type: String,
    optional: true
  },
  "tags.$.url": {
    type: String,
    optional: true
  },
  "tags.$.rank": {
    type: Number,
    optional: true
  },
  membersOnly: {
    //Visible to members of the organization
    type: Boolean,
    autoValue: function () {
      if (this.isInsert) {
        return false;
      }
    }
  },
  executionStatus: {
    //Execution status: DRAFT, APPROVED, ALTERNATIVE, REJECTED
    type: String,
    allowedValues: ['OPEN', 'APPROVED', 'ALTERNATIVE', 'REJECTED', 'VOID'],
    autoValue: function () {
      if (this.isInsert) {
        return 'OPEN';
      }
    }
  },
  anonymous: {
    //Anonymous contract
    type: Boolean,
    autoValue: function () {
      if (this.isInsert) {
        return false;
      }
    }
  },
  signatures: {
    //Collection of authors that signed this contract
    type: Array,
    optional: true
  },
  "signatures.$": {
    type: Object
  },
  "signatures.$._id": {
    type: String
  },
  "signatures.$.username": {
    type: String,
    optional: true
  },
  "signatures.$.role": {
    type: String,
    allowedValues: ['AUTHOR', 'DELEGATOR', 'DELEGATE', 'ENDORSER'],
    optional: true
  },
  "signatures.$.status": {
    type: String,
    allowedValues: ['PENDING', 'REJECTED', 'CONFIRMED'],
    optional: true
  },
  "signatures.$.hash": {
    type: String,
    optional: true
  },
  closingDate: {
    //When the contract decision closes (poll closing)
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        var creationDate = new Date;
        creationDate.setDate(creationDate.getDate() + 1);
        return creationDate;
      }
    }
  },
  alwaysOpen: {
    //If contract never closes and is always open
    type: Boolean,
    autoValue: function () {
      if (this.isInsert) {
        return false;
      }
    }
  },
  allowForks: {
    //If adding as an option other contracts is possible
    type: Boolean,
    autoValue: function () {
      if (this.isInsert) {
        return false;
      }
    }
  },
  secretVotes: {
     //If votes will be strictly kept secret
     type: Boolean,
     autoValue: function () {
       if (this.isInsert) {
         return false;
       }
     }
  },
  realtimeResults: {
      //If results of the election are shown on real-time
     type: Boolean,
     autoValue: function () {
       if (this.isInsert) {
         return false;
       }
     }
  },
  multipleChoice: {
    //If selection of multiple options on ballot is allowed
    type: Boolean,
    autoValue: function () {
      if (this.isInsert) {
        return false;
      }
    }
  },
  rankPreferences: {
    //If Ballot dynamic is based on ranking preferences
    type: Boolean,
    autoValue: function () {
      if (this.isInsert) {
        return false;
      }
    }
  },
  executiveDecision: {
    //If contract includes options of final decisoin (AUTHORIZE & REJECT)
    type: Boolean,
    autoValue: function () {
      if (this.isInsert) {
        return true;
      }
    }
  },
  stage: {
    //Current stage of this contract: DRAFT, LIVE, FINISH
    type: String,
    allowedValues: ['DRAFT', 'LIVE', 'FINISH'],
    autoValue: function () {
      if (this.isInsert) {
        return 'DRAFT';
      }
    }
  },
  transferable: {
    type: Boolean,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('kind').value === 'DELEGATION') {
          return true;
        }
      }
    }
  },
  limited: {
    type: Boolean,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('kind').value === 'DELEGATION') {
          return false;
        }
      }
    }
  },
  portable: {
    type: Boolean,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('kind').value === 'DELEGATION') {
          return false;
        }
      }
    }
  },
  ballot: {
    //Ballot options of the contract
    type: Array,
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
  ballotEnabled: {
    type: Boolean,
    autoValue: function () {
      if (this.isInsert) {
        return false;
      }
    }
  },
  "ballot.$.label": {
    type: String,
    optional: true
  },
  authorized: {
    //This contract has been authorized
    type: Boolean,
    autoValue: function () {
      if (this.isInsert) {
        return false;
      }
    }
  },
  isDefined: {
    //This contract has a definition/description
    type: Boolean,
    autoValue: function () {
      if (this.isInsert) {
        return false;
      }
    }
  },
  isRoot: {
    //This contract is core to the organization (Constitutional)
    type: Boolean,
    autoValue: function () {
      if (this.isInsert) {
        return true;
      }
    }
  },
  referrers: {
    //Other contracts referring to this one
    type: Array,
    optional: true
  },
  "referrers.$": {
      type: Object
  },
  events: {
    type: Array,
    autoValue: function () {
      if (this.isInsert) {
        return [];
      }
    }
  },
  "events.$": {
    type: Thread,
    optional: true
  },
  wallet: {
    type: Wallet,
    optional: true
  },
});

Contracts.attachSchema(Schema.Contract);

export const schemaContract = Schema.Contract;
/*
*  FIX: temporary workaround
*  TBD: apply security best practices
*  All to methods, validate paramenters
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
