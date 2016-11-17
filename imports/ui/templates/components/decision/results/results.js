import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';

import { showResults } from '/imports/ui/modules/ballot';

import './results.html';

Template.results.helpers({
  result() {
    return showResults(Session.get('contract'));
  },
  percentageLabel() {
    return parseInt(this.percentage).toString() + '%'
  },
  votes() {
    return TAPi18n.__('total-votes').replace('<votes>', this.votes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  },
  label() {
    switch (this.mode) {
      case 'REJECT':
      case 'AUTHORIZE':
        return TAPi18n.__(this.mode);
      default:
        return this.label;
    }
  },
  unanimous() {
    if (this.percentage === 100) {
      return 'result-unanimous';
    }
    return false;
  },
});
