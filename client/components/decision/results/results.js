Template.results.helpers({
  result: function () {
    return Modules.client.showResults(Session.get('contract'));
  },
  percentageLabel: function () {
    return parseInt(this.percentage).toString() + '%'
  },
  votes: function () {
    return TAPi18n.__('total-votes').replace('<votes>', this.votes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  },
  label: function () {
    switch (this.mode) {
      case BALLOT_OPTION_MODE_REJECT:
      case BALLOT_OPTION_MODE_AUTHORIZE:
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
