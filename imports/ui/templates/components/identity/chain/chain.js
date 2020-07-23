import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';

import { getCoin } from '/imports/api/blockchain/modules/web3Util';

import '/imports/ui/templates/components/identity/chain/chain.html';

Template.chain.helpers({
  hasAddress() {
    return this.address !== '';
  },
  ticker() {
    return `${getCoin(this.ticker).code} ${TAPi18n.__('id')}:`;
  },
  address() {
    let length = 15;
    if (window.innerWidth <= 479) {
      length = 6;
    } else if (window.innerWidth <= 767) {
      length = 10;
    }
    return (window.innerWidth <= 991) ? `${this.address.substring(0, length)}...${this.address.substring(parseInt(this.address.length - length, 10), this.address.length)}` : this.address;
  },
  color() {
    return `background-color: ${getCoin(this.ticker).color};`;
  },
  fullAddress() {
    return this.address;
  },
  link() {
    return `${Meteor.settings.public.web.sites.blockExplorer}/address/${this.address}`;
  },
});

Template.chain.events({
  'click #chainAddress'() {
    // TODO: copy to clipboard;
  },
});
