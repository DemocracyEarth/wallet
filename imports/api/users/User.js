import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Wallet } from './Wallet';
import { Country } from '../collectives/Collectives';

const Schema = {};

Schema.Credential = new SimpleSchema({
  source: {
    type: String,
    allowedValues: ['facebook', 'twitter', 'linkedin', 'github', 'peer', 'blockstack', 'metamask', 'auth0'],
    optional: true,
  },
  URL: {
    type: String,
    optional: true,
  },
  validated: {
    type: Boolean,
    optional: true,
  },
});

Schema.Settings = new SimpleSchema({
  splitLeftWidth: {
    type: String,
    optional: true,
  },
  splitRightWidth: {
    type: String,
    optional: true,
  },
});

Schema.Menu = new SimpleSchema({
  feed: {
    type: String,
    optional: true,
    autoValue() {
      if (this.isInsert) {
        return 'all';
      }
    },
  },
  lastView: {
    type: Date,
    optional: true,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      }
    },
  },
  newItems: {
    type: Number,
    optional: true,
    autoValue() {
      if (this.isInsert) {
        return 0;
      }
    },
  },
});

Schema.Profile = new SimpleSchema({
  firstName: {
    type: String,
    optional: true,
  },
  lastName: {
    type: String,
    optional: true,
  },
  fullName: {
    type: String,
    optional: true,
  },
  picture: {
    type: String,
    optional: true,
    autoValue() {
      if (this.isInsert) {
        if (!this.isSet) {
          return '/images/noprofile.png';
        }
      }
    }
  },
  country: {
    type: Country,
    optional: true,
  },
  birthday: {
    type: Date,
    optional: true,
  },
  gender: {
    type: String,
    allowedValues: ['Male', 'Female'],
    optional: true,
  },
  organization: {
    type: String,
    optional: true,
  },
  website: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  bio: {
    type: String,
    optional: true,
  },
  configured: {
    type: Boolean,
    optional: true,
  },
  credentials: {
    type: Array,
    optional: true,
  },
  'credentials.$': {
    type: Schema.Credential,
    optional: true,
  },
  url: {
    type: String,
    optional: true,
  },
  menu: {
    type: Array,
    defaultValue: [],
    optional: true,
  },
  'menu.$': {
    type: Schema.Menu,
    optional: true,
  },
  wallet: {
    type: Wallet,
    optional: true,
  },
  settings: {
    type: Schema.Settings,
    optional: true,
  },
});

Schema.User = new SimpleSchema({
  username: {
    type: String,
    autoValue() {
      if (this.value) {
        return this.value.toLowerCase();
      }
    },
  },
  emails: {
    type: Array,
    optional: true,
  },
  'emails.$': {
    type: Object,
  },
  'emails.$.address': {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },
  'emails.$.verified': {
    type: Boolean,
  },
  // use this registered_emails field if you are using splendido:meteor-accounts-emails-field
  registered_emails: {
    type: [Object],
    optional: true,
    blackbox: true,
  },
  createdAt: {
    type: Date,
  },
  profile: {
    type: Schema.Profile,
    optional: true,
  },
  // make sure this services field is in your schema if you're using any of the accounts packages
  services: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  // add `roles` to your schema if you use the meteor-roles package.
  roles: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  // in order to avoid an 'Exception in setInterval callback' from Meteor
  heartbeat: {
    type: Date,
    optional: true,
  },
});

export const UserContext = Schema.User.newContext();
Meteor.users.attachSchema(Schema.User);

export const User = Schema.User;

/*
*  FIX: temporary workaround
*  TBD: apply security best practices
*  All to methods, validate parameters
*/
// permissions
Meteor.users.allow({
  insert: function (userId) {
    if (userId) {
      return true;
    }
  },
  update: function (userId) {
    if (userId) {
      return true;
    }
  },
  remove: function (userId) {
    if (userId) {
      return true;
    }
  },
});
