var typingTimer; //timer identifier

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


Template.title.events({
  "input #titleContent": function (event) {
    var content = document.getElementById("titleContent").innerText;//jQuery($("#titleContent").html()).text();
    var keyword = convertToSlug(content);
    var contract = Contracts.findOne( { keyword: keyword } );

    //Set timer to check upload to db
    Meteor.clearTimeout(typingTimer);
    Session.set('contractKeyword', keyword);
    Session.set('URLStatus', 'VERIFY');

    //Checking content typed
    if (content == '') {
      Session.set('contractKeyword', keyword);
      Session.set('URLStatus', 'UNAVAILABLE');
      Session.set('missingTitle', true);
      return;
    } else if (keyword.length < 3) {
      Session.set('contractKeyword', keyword);
      Session.set('URLStatus', 'UNAVAILABLE');
      Session.set('mistypedTitle', true);
      Session.set('missingTitle', false);
      return;
    } else {
      Session.set('missingTitle', false);
      Session.set('mistypedTitle', false);
    }

    //Call function when typing seems to be finished.
    typingTimer = Meteor.setTimeout(function () {
      if (contract != undefined && contract._id != Session.get('contractId')) {
          Session.set('URLStatus', 'UNAVAILABLE');
      } else {
        if (Contracts.update({_id : getContract()._id }, { $set: { title: content, keyword: keyword, url: "/" + Session.get('kind') + "/" + keyword }})) {
          Session.set('URLStatus', 'AVAILABLE');
        };
      }
    }, SERVER_INTERVAL);
  },
  "keypress #titleContent": function (event) {
    var content = document.getElementById("titleContent").innerText;
    return (content.length <= TITLE_MAX_LENGTH) && event.which != 13;
  },
  "focus #titleContent": function (event) {
    if (Session.get('missingTitle')) {
      document.getElementById("titleContent").innerText = '';
      Session.set('missingTitle',false);
    }

  },
  "blur #titleContent": function (event) {
    var content = document.getElementById("titleContent").innerText;
    if (content == '' || content == ' ') {
      Session.set('missingTitle',true);
      document.getElementById("titleContent").innerText = TAPi18n.__('no-title');
    }
  }
});
