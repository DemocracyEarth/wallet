import {default as Thread} from "./Thread";
import {default as Wallet} from "./Wallet";

Contracts = new Mongo.Collection("contracts");

Schema.Contract = new SimpleSchema({
  collectiveId: {
    type: String,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        if (Meteor.settings.public.Collective) {
          return Meteor.settings.public.Collective._id;
        }
      };
    }
  },
  title: {
    //title of the contract
    type: String,
    autoValue: function () {
      if (this.isInsert) {
        if (this.field("title").value == undefined) {
          return '';
        } else {
          return this.field("title").value;
        }
      }
    }
  },
  keyword: {
    //unique string identifier in db as keyword-based-slug
    type: String,
    autoValue: function () {
      var slug = convertToSlug(this.field("title").value);
      if (this.isInsert) {
        if (this.field('kind').value == KIND_DELEGATION) {
          return this.field('keyword').value;
        } else {
          if (this.field('keyword').value == undefined) {
            if (this.field("title").value != undefined) {
              if (Contracts.findOne({keyword: slug}) == undefined) {
                if (this.field("title").value != '') {
                  return slug;
                } else {
                  return 'draft-' + Meteor.userId();
                }
              }
            } else {
              return 'draft-' + Meteor.userId();
            }
          }
        };
      }
    }
  },
  kind: {
    //Kind of contract
    type: String,
    allowedValues: [KIND_DRAFT, KIND_VOTE, KIND_DELEGATION, KIND_MEMBERSHIP],
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('kind').value == undefined) {
          return "VOTE";
        }
      };
    }
  },
  context: {
    //Context this contract lives on the system
    type: String,
    allowedValues: [CONTEXT_GLOBAL, CONTEXT_LOCAL],
    autoValue: function () {
      if (this.isInsert) {
        return "GLOBAL";
      };
    }
  },
  url:  {
     //URL inside the instance of .Earth
    type: String,
    autoValue: function () {
      var slug = convertToSlug(this.field("title").value);
      if (this.isInsert) {
        if (this.field('kind').value == KIND_DELEGATION) {
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
        if (this.field('kind').value == KIND_DELEGATION) {
          return TAPi18n.__('default-delegation-contract');
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
    allowedValues: [EXECUTION_STATUS_OPEN, EXECUTION_STATUS_APPROVED, EXECUTION_STATUS_ALTERNATIVE, EXECUTION_STATUS_REJECTED],
    autoValue: function () {
      if (this.isInsert) {
        return EXECUTION_STATUS_OPEN;
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
    type: String,
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('kind').value == KIND_VOTE) {
          return this.userId;
        }
      };
    }
  },
  "signatures.$.username": {
    type: String,
    optional: true
  },
  "signatures.$.role": {
    type: String,
    allowedValues: [ROLE_AUTHOR, ROLE_DELEGATOR, ROLE_DELEGATE, ROLE_ENDORSER],
    optional: true
  },
  "signatures.$.status": {
    type: String,
    allowedValues: [SIGNATURE_STATUS_PENDING, SIGNATURE_STATUS_REJECTED, SIGNATURE_STATUS_CONFIRMED],
    optional: true
  },
  "signatures.$.hash": {
    type: String,
    optional: true
  },
  "signatures.$.picture": {
    type: String,
    optional: true
  },
  "signatures.$.firstName": {
    type: String,
    optional: true
  },
  "signatures.$.lastName": {
    type: String,
    optional: true
  },
  "signatures.$.country": {
    type: Schema.Country,
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
    allowedValues: [STAGE_DRAFT, STAGE_LIVE, STAGE_FINISH],
    autoValue: function () {
      if (this.isInsert) {
        return STAGE_DRAFT;
      }
    }
  },
  transferable: {
    type: Boolean,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        if (this.field('kind').value == KIND_DELEGATION) {
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
        if (this.field('kind').value == KIND_DELEGATION) {
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
        if (this.field('kind').value == KIND_DELEGATION) {
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
  }
});

Contracts.attachSchema(Schema.Contract);
