Collective = new Mongo.Collection("collective");

Schema.CollectiveProfile = new SimpleSchema({
    stateId: {
        type: String,
        optional: true
    },
    blockchainId: {
        type: String,
        optional: true
    },
    flag: {
        type: String,
        optional: true
    },
    jurisdiction: {
        type: Schema.UserCountry,
        optional: true
    },
    foundationDay: {
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
    website: {
        type: String,
        regEx: SimpleSchema.RegEx.Url,
        optional: true
    },
    bio: {
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
    registered_emails: {
        type: [Object],
        optional: true,
        blackbox: true
    },
    createdAt: {
        type: Date
    },
    profile: {
        type: Schema.CollectiveProfile,
        optional: true
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    votes: {
        type: Schema.Votes,
        optional: true
    }
});

Collective.attachSchema(Schema.Collective);
