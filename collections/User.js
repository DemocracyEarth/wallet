import {default as Wallet} from "./Wallet";

Schema.Credential = new SimpleSchema({
  source: {
    type: String,
    allowedValues: ['facebook', 'twitter', 'linkedin', 'github', 'peer'],
    optional: true
  },
  URL: {
    type: String,
    optional: true
  },
  validated: {
    type: Boolean,
    optional: true
  }
});

Schema.FeedMenu = new SimpleSchema({
  feed: {
    type: String,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return 'all';
      }
    }
  },
  lastView: {
    type: Date,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      }
    }
  },
  newItems: {
    type: Number,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return 0;
      }
    }
  }
})

Schema.Profile = new SimpleSchema({
    firstName: {
      type: String,
      optional: true
    },
    lastName: {
      type: String,
      optional: true
    },
    picture: {
      type: String,
      optional: true,
      autoValue: function () {
        if (this.isInsert) {
          return '/images/noprofile.png';
        }
      }
    },
    country: {
        type: Schema.Country,
        optional: true
    },
    birthday: {
        type: Date,
        optional: true
    },
    gender: {
        type: String,
        allowedValues: ['Male', 'Female'],
        optional: true
    },
    organization : {
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
    },
    credentials: {
      type: Array,
      optional: true
    },
    "credentials.$": {
      type: Schema.Credential,
      optional: true
    },
    url: {
      type: String,
      optional: true
    },
    menu: {
      type: Array,
      defaultValue: [],
      optional: true
    },
    "menu.$": {
      type: Schema.FeedMenu,
      optional: true
    },
    wallet: {
      type: Wallet,
      optional: true
    }
});

Schema.User = new SimpleSchema({
    username: {
        type: String,
        optional: true
    },
    emails: {
        type: Array,
        // For accounts-password, either emails or username is required, but not both. It is OK to make this
        // optional here because the accounts-password package does its own validation.
        // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
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
    // Use this registered_emails field if you are using splendido:meteor-accounts-emails-field / splendido:meteor-accounts-meld
    registered_emails: {
        type: [Object],
        optional: true,
        blackbox: true
    },
    createdAt: {
        type: Date
    },
    profile: {
        type: Schema.Profile,
        optional: true
    },
    // Make sure this services field is in your schema if you're using any of the accounts packages
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    // Add `roles` to your schema if you use the meteor-roles package.
    // Option 1: Object type
    // If you specify that type as Object, you must also specify the
    // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
    // Example:
    // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
    // You can't mix and match adding with and without a group since
    // you will fail validation in some cases.
    roles: {
        type: Object,
        optional: true,
        blackbox: true
    },
    // Option 2: [String] type
    // If you are sure you will never need to use role groups, then
    // you can specify [String] as the type
    roles: {
        type: [String],
        optional: true
    },
    // In order to avoid an 'Exception in setInterval callback' from Meteor
    heartbeat: {
        type: Date,
        optional: true
    }
});

UserContext = Schema.User.newContext();
Meteor.users.attachSchema(Schema.User);

export default Schema.User;
