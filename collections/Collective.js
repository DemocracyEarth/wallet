Collective = new Mongo.Collection("collective");

Schema.Location = new SimpleSchema({
  address: {
    type: String,
    optional: true
  },
  state: {
    type: String,
    optional: true
  },
  country: {
    type: Schema.UserCountry,
    optional: true
  }
});

Schema.Jurisdiction = new SimpleSchema({
  legal: {
    type: Object,
    optional: true
  },
  "legal.taxId": {
    type: String,
    optional: true
  },
  "legal.name": {
    type: String,
    optional: true
  },
  "legal.type": {
    type: String,
    optional: true
  },
  location: {
    type: SimpleSchema.Location,
    optional: true
  }
});

Schema.CollectiveProfile = new SimpleSchema({
    website: {
        type: String,
        regEx: SimpleSchema.RegEx.Url,
        optional: true
    },
    bio: {
        type: String,
        optional: true
    },
    stateId: {
        type: String,
        optional: true
    },
    blockchain: {
        type: Object,
        optional: true
    },
    "blockchain.address": {
      type: String,
      optional: true
    },
    logo: {
        type: String,
        optional: true
    },
    jurisdiction: {
        type: Schema.UserCountry,
        optional: true
    },
    foundation: {
        type: Date,
        optional: true
    },
    goal: {
        type: String,
        allowedValues: ['Profit', 'Free'],
        optional: true
    },
    owners : {
        type: String,
        optional: true
    },
    configured: {
      type: Boolean,
      optional: true
    }
});


Schema.Collective =  new SimpleSchema({
    domain: {
        type: String
    },
    emails: {
        type: Array,
        optional: true
    },
    "emails.$": {
        type: Object
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    profile: {
        type: Schema.CollectiveProfile,
        optional: true
    },
    votes: {
        type: Schema.Votes,
        optional: true
    },
    goal: {
      type: String,
      allowedValues: ['Business', 'Free'],
      optional: true
    },
    authorities: {
      type: Array,
      optional: true
    },
    "authorities.$": {
      type: Object,
      optional: true
    },
    "authorities.$.userId": {
      type: String,
      optional: true
    }
});

Collective.attachSchema(Schema.Collective);
