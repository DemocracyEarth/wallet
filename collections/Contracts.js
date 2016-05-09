Contracts = new Mongo.Collection("contracts");

ContractSchema = new SimpleSchema({
  title: {
    //Title of the contract
    type: String,
    optional: false
  },
  keyword: {
    //Unique identifier in DB as keyword-based-slug
    type: String,
    autoValue: function () {
      if (this.isInsert) {
        return convertToSlug(this.field("title").value);
      };
    }
  },
  kind: {
    //Kind of contract
    type: String,
    allowedValues: ['VOTE', 'DELEGATION', 'MEMBERSHIP'],
    autoValue: function () {
      if (this.isInsert) {
        return "VOTE";
      };
    }
  },
  context: {
    //Context this contract lives on the system
    type: String,
    allowedValues: ['GLOBAL', 'LOCAL'],
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
      if (this.isInsert) {
        return '/vote/' + convertToSlug(this.field("title").value);
      }
    }
  },
  description:  {
    //HTML Description of the contract (the contents of the contract itself)
    type: String,
    optional: true
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
      return new Date();
    }
  },
  tags: {
    //Collection of Tags semantically describing contract
    type: Array,
    optional: true
  },
  "tags.$": {
      type: Object
  },
  "tags.$._id": {
    type: String
  },
  "tags.$.label": {
    type: String
  },
  "tags.$.url": {
    type: String
  },
  "tags.$.rank": {
    type: Number
  },
  membersOnly: {
    //Visible to members of the organization
    type: Boolean,
    autoValue: function () {
      return false;
    }
  },
  executionStatus: {
    //Execution status: DRAFT, APPROVED, ALTERNATIVE, REJECTED
    type: String,
    allowedValues: ['DRAFT', 'LIVE', 'APPROVED', 'ALTERNATIVE', 'REJECTED'],
    autoValue: function () {
      return 'DRAFT';
    }
  },
  anonymous: {
    //Anonymous contract
    type: Boolean,
    autoValue: function () {
      return false;
    }
  },
  authors: {
    //Collection of authors that signed this contract
    type: Array,
    optional: true
  },
  "authors.$": {
    type: Object
  },
  "authors.$._id": {
    type: String,
    autoValue: function () {
      if (this.isInsert) {
        return this.userId;
      };
    }
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
      return false;
    }
  },
  allowForks: {
    //If adding as an option other contracts is possible
    type: Boolean,
    autoValue: function () {
      return true;
    }
  },
  secretVotes: {
     //If votes will be strictly kept secret
     type: Boolean,
     autoValue: function () {
       return false;
     }
  },
  realtimeResults: {
      //If results of the election are shown on real-time
     type: Boolean,
     autoValue: function () {
       return false;
     }
  },
  multipleChoice: {
    //If selection of multiple options on ballot is allowed
    type: Boolean,
    autoValue: function () {
     return false;
    }
  },
  rankPreferences: {
    //If Ballot dynamic is based on ranking preferences
    type: Boolean,
    autoValue: function () {
     return false;
    }
  },
  executiveDecision: {
    //If contract includes options of final decisoin (AUTHORIZE & REJECT)
    type: Boolean,
    autoValue: function () {
     return true;
    }
  },
  stage: {
    //Current stage of this contract: DRAFT, LIVE, FINISH
    type: String,
    allowedValues: ['DRAFT', 'LIVE', 'FINISH'],
    autoValue: function () {
     return "DRAFT";
    }
  },
  ballot: {
    //Ballot options of the contract
    type: Array,
    optional: true
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
      return false;
    }
  },
  isDefined: {
    //This contract has a definition/description
    type: Boolean,
    autoValue: function () {
      return false;
    }
  },
  isRoot: {
    //This contract is core to the organization (Constitutional)
    type: Boolean,
    autoValue: function () {
      return true;
    }
  },
  referrers: {
    //Other contracts referring to this one
    type: Array,
    optional: true
  },
  "referrers.$": {
      type: Object
  }
});

Contracts.attachSchema(ContractSchema);
