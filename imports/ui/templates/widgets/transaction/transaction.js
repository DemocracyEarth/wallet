import { Template } from 'meteor/templating';
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
    // TODO: this data should be from ledger
    return this.wallet.available;
  },
  source() {
    return TAPi18n.__('delegated-votes');
  },
  emptyVotes() {
    // TODO: this data should be from ledger
    if (this.wallet.available === 0) {
      // return 'display:none';
    }
    return '';
  },
  onCard() {
    if (this.onCard) {
      return 'vote-delegation-card';
    }
    return '';
  },
});
