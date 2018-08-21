import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';

import { token } from '/lib/token';

import '/imports/ui/templates/components/identity/chain/chain.html';

const _getTicker = (code) => {
  const result = _.where(token.coin, { code });
  if (result.length === 0) {
    return _.where(token.coin, { decimal: code });
  }
  return result;
};

Template.chain.helpers({
  hasAddress() {
    return this.address !== '';
  },
  ticker() {
    return `${_getTicker(this.ticker)[0].name} ${TAPi18n.__('id')}`;
  },
  address() {
    if (this.address.length > 30) {
      return `${this.address.substring(0, 15)}...${this.address.substring(parseInt(this.address.length - 15, 10), this.address.length)}`;
    }
    return this.address;
  },
  color() {
    return `background-color: ${_getTicker(this.ticker)[0].color};`;
  },
  fullAddress() {
    return TAPi18n.__('copy-clipboard').replace('{{address}}', this.address);
  },
});

Template.chain.events({
  'click #chainAddress'() {

  },
});
