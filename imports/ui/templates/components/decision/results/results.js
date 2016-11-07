import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';

import { showResults } from '/imports/ui/modules/ballot';

Template.results.helpers({
  result: function () {
    return showResults(Session.get('contract'));
  },
  percentageLabel: function () {
    return parseInt(this.percentage).toString() + '%'
  },
  votes: function () {
    return TAPi18n.__('total-votes').replace('<votes>', this.votes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  },
  label: function () {
    switch (this.mode) {
      case 'REJECT':
      case 'AUTHORIZE':
        return TAPi18n.__(this.mode);
      default:
        return this.label;
    }
  },
  unanimous: function () {
    if (this.percentage == 100) {
      return 'result-unanimous';
    }
  }
});
