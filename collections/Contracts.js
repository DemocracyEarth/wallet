Contracts = new Mongo.Collection("contracts");

ContractSchema = new SimpleSchema({
  title: {
    type: String,
  },
  keyword: {
    //Unique identifier in DB as keyword-based-slug
    type: String,
  },
  kind: {
    //Kind of contract: VOTE, TAG, IDENTITY
    type: String,
    autoValue: function () {
      return "VOTE";
    }
  },
  context: {
    //Context this contract lives on the system
    type: String,
    autoValue: function () {
      return "GLOBAL";
    }
  },
  url:  {
     //URL inside the instance of .Earth
    type: String
  },
  description:  {
    //HTML Description of the contract (the contents of the contract itself)
    type: String
  },
  createdAt: {
    //Creation Date
    type: Date,
    autoValue: function () {
      return new Date();
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
    type: Array
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
    type: Array
  },
  "authors.$": {
      type: Object
  },
  closingDate: {
    //When the contract decision closes (poll closing)
    type: Date,
    autoValue: function () {
      var creationDate = new Date;
      return creationDate.setDate(creationDate.getDate() + 1);
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
    autoValue: function () {
     return "DRAFT";
    }
  },
  ballot: {
    //Ballot options of the contract
    type: Array
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
    type: Array
  },
  "referrers.$": {
      type: Object
  }
});
