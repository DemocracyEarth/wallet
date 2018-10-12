import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';

import { token } from '/lib/token';

import '/imports/ui/templates/components/identity/chain/chain.html';

const _getCoin = (code) => {
  let result = _.where(token.coin, { code });
  console.log(_.where(token.coin, { code }));
  console.log(code);
  if (result.length === 0) {
    result = _.where(token.coin, { subcode: code });
  }
  if (result.length === 0) {
    if (code === 'VOTES') {
      result = _.where(token.coin, { code: 'VOTE' });
    } else {
      return { code };
    }
  }
  return result[0];
};

Template.chain.helpers({
  hasAddress() {
    return this.address !== '';
  },
  ticker() {
    return `${_getCoin(this.ticker).code} ${TAPi18n.__('id')}:`;
  },
  address() {
    if (this.address.length > 42) {
      return `${this.address.substring(0, 15)}...${this.address.substring(parseInt(this.address.length - 15, 10), this.address.length)}`;
    }
    return this.address;
  },
  color() {
    return `background-color: ${_getCoin(this.ticker).color};`;
  },
  fullAddress() {
    return TAPi18n.__('copy-clipboard').replace('{{address}}', this.address);
  },
  web() {

  },
});

Template.chain.events({
  'click #chainAddress'() {
    // TODO: copy to clipboard;
  },
});

export const getCoin = _getCoin;
