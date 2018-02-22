import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';

import './transaction.html';

Template.transaction.onCreated(function () {
});

Template.transaction.helpers({
  sender() {
    return {
      _id: this.contract.signatures[0]._id,
      imgStyle: () => {
        if (this.compressed) {
          return 'float: left; margin-top: 4px;';
        }
        return '';
      },
    };
  },
  receiver() {
    // return this.contract.signatures[1]._id;
    return {
      _id: this.contract.signatures[1]._id,
      imgStyle: () => {
        if (this.compressed) {
          return ' margin-top: 4px; margin-left: 5px; ';
        }
        return '';
      },
    };
  },
  value() {
    // TODO: this data should be from ledger
    return this.contract.wallet.available;
  },
  source() {
    return TAPi18n.__('delegated-votes');
  },
  emptyVotes() {
    // TODO: this data should be from ledger
    if (this.contract.wallet.available === 0) {
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
