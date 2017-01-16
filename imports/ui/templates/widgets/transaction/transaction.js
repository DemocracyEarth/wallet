import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';

import './transaction.html';

Template.transaction.helpers({
  sender() {
    return this.signatures[0]._id;
  },
  receiver() {
    return this.signatures[1]._id;
  },
  value() {
    return this.wallet.available;
  },
  source() {
    return TAPi18n.__('delegated-votes');
  },
});
