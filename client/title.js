if (Meteor.isClient) {

  // Title of Contract
  Template.title.helpers({
    blockchainAddress: function () {
      return '19c...t9E';
    },
    declaration: function() {
      var title = Contracts.findOne( { _id: Session.get('contractId') },{reactive: false} ).title;
      if (title == '' || title == undefined) {
        Session.set('missingTitle', true);
        return TAPi18n.__('no-title');
      } else {
        Session.set('missingTitle', false);
        return title;
      }
    },
    sampleMode: function() {
      if (Session.get('missingTitle')) {
        return 'sample';
      } else {
        return '';
      }
    },
    contractURL: function () {
      var host =  window.location.host;
      var keyword = '';

      if (Session.get('contractKeyword') == undefined) {
        Session.set('contractKeyword', getContract().keyword);
      } else if (Session.get('contractKeyword') != getContract().keyword) {
        keyword = Session.get('contractKeyword');
      } else {
        keyword = getContract().keyword;
      }

      return host + "/" + Session.get('kind') + "/<strong>" + keyword + "</strong>";
    },
    missingTitle: function () {
      if (Session.get('missingTitle')) {
        Session.set('URLStatus', 'UNAVAILABLE');
      }
      return Session.get('missingTitle');
    },
    mistypedTitle: function () {
      return Session.get('mistypedTitle');
    },
    URLStatus: function () {
      switch (Session.get("URLStatus")) {
        case "VERIFY":
          return TAPi18n.__('url-verify');
          break;
        case "UNAVAILABLE":
          return TAPi18n.__('url-unavailable');
          break;
        case "AVAILABLE":
          return TAPi18n.__('url-available');
          break;
      }
    },
    verifierMode: function () {
      switch (Session.get("URLStatus")) {
        case "VERIFY":
          animate($('.state'), 'tilt', { loop: true, duration: 750 });
          return 'verifying';
          break;
        case "UNAVAILABLE":
          animate($('.state'), 'fade-in');
          return 'unavailable';
          break;
        case "AVAILABLE":
          animate($('.state'), 'fade-in');
          return 'available';
          break;
        default:
          return 'invisible';
      }
    },
    duplicateURL: function () {
      return Session.get('duplicateURL');
    },
    timestamp: function () {
      var d = new Date;
      d = getContract().timestamp;
      return d.format('{Month} {d}, {yyyy}');
    }
  });

}
