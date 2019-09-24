import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Wallet } from '/imports/api/users/Wallet';
import { Blockchain } from '/imports/api/blockchain/Blockchain';

export const Collectives = new Mongo.Collection('collectives');

const Schema = {};
Schema.Country = new SimpleSchema({
  name: {
    type: String,
  },
  code: {
    type: String,
  },
});


Schema.Jurisdiction = new SimpleSchema({
  legal: {
    type: Object,
    optional: true,
  },
  'legal.taxId': {
    type: String,
    optional: true,
  },
  'legal.name': {
    type: String,
    optional: true,
  },
  'legal.type': {
    type: String,
    optional: true,
  },
  location: {
    type: Object,
    optional: true,
  },
  'location.address': {
    type: String,
    optional: true,
  },
  'location.state': {
    type: String,
    optional: true,
  },
  'location.country': {
    type: Schema.Country,
    optional: true,
  },
});

Schema.Menu = new SimpleSchema({
  separator: {
    type: Boolean,
    optional: true,
  },
  label: {
    type: String,
    optional: true,
  },
  icon: {
    type: String,
    optional: true,
  },
  iconActivated: {
    type: String,
    optional: true,
  },
  feed: {
    type: String,
    optional: true,
  },
  value: {
    type: Boolean,
    optional: true,
  },
  url: {
    type: String,
    optional: true,
  },
  displayToken: {
    type: Boolean,
    defaultValue: false,
    optional: true,
  },
});


Schema.CollectiveProfile = new SimpleSchema({
  website: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  bio: {
    type: String,
    optional: true,
  },
  blockchain: {
    type: Blockchain,
    optional: true,
  },
  logo: {
    type: String,
    optional: true,
  },
  jurisdiction: {
    type: Schema.Jurisdiction,
    optional: true,
  },
  foundation: {
    type: Date,
    optional: true,
  },
  goal: {
    type: String,
    allowedValues: ['Profit', 'Free'],
    optional: true,
  },
  owners: {
    type: String,
    optional: true,
  },
  configured: {
    type: Boolean,
    optional: true,
  },
  wallet: {
    type: Wallet,
    optional: true,
  },
  menu: {
    type: Schema.Menu,
    optional: true,
  },
});


Schema.Collective = new SimpleSchema({
  name: {
    type: String,
  },
  domain: {
    type: String,
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
  profile: {
    type: Schema.CollectiveProfile,
    optional: true,
  },
  goal: {
    type: String,
    allowedValues: ['Business', 'Free', 'Commons'],
    optional: true,
  },
  authorities: {
    type: Array,
    optional: true,
  },
  'authorities.$': {
    type: Object,
    optional: true,
  },
  'authorities.$.userId': {
    type: String,
    optional: true,
  },
});

Collectives.attachSchema(Schema.Collective);

export const Country = Schema.Country;

/*
*  FIX: temporary workaround
*  TBD: apply security best practices
*  All to methods, validate paramenters
*/
Collectives.allow({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  },
});
