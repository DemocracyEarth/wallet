import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { TAPi18n } from 'meteor/tap:i18n';

import './transaction.html';

Template.transaction.onRendered = function (value) {
  console.log(value);
};

Template.transaction.helpers({
  sender() {
    return this.signatures[0]._id;
  },
  receiver() {
    return this.signatures[1]._id;
  },
  value() {
    console.log(this);
    return '393';
  },
  source() {

  },
});
