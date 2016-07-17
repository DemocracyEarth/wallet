var searchHTMLElement = '#searchInput';
var typingTimer; //timer identifier

Template.alternative.rendered = function () {
  ProposalSearch.search('');
}

Template.alternative.helpers({
  searchInput: function () {
    if (Session.get('searchInput')) {
      return 'search-active';
    } else {
      return '';
    }
  },
  getProposals: function() {
    var search = ProposalSearch.getData({
      transform: function(matchText, regExp) {
        var htmlRegex = new RegExp("<([A-Za-z][A-Za-z0-9]*)\\b[^>]*>(.*?)</\\1>");
        if(!htmlRegex.test(matchText)) {
          return matchText.replace(regExp, "<b>$&</b>");
        } else {
          return matchText;
        }
      },
      sort: {isoScore: -1}
    });
    return search;
  },
  createProposal: function () {
    return displayElement('createProposal');
  },
  removeProposal: function () {
    return displayElement('removeProposal');
  },
  newProposal: function () {
    return Session.get('newProposal');
  },
  newProposalURL: function () {
    var host =  window.location.host;
    var keyword = convertToSlug(Session.get('newProposal'));

    return host + "/" + Session.get('contract').kind.toLowerCase() + "/"  +  "<strong>" + keyword + "</strong>";
  },
  URLStatus: function () {
    return Modules.client.URLCheck('proposalURLStatus');
  },
  verifierMode: function () {
    return Modules.client.URLVerifier('proposalURLStatus');
  },
  newProposalTimestamp: function () {
    var d = new Date;
    return d.format('{Month} {d}, {yyyy}');
  },
  newProposalStatus: function () {
    switch (Session.get("proposalURLStatus")) {
      case "VERIFY":
      case "UNAVAILABLE":
        return 'action-search-disabled';
      case "AVAILABLE":
        return '';
    }
  },
  emptyList: function () {
    if (Contracts.findOne( { _id: Session.get('contractId') } ).tags.length == 0) {
      return '';
    } else {
      return 'display:none';
    }
  },
  searchBox: function () {
    if (Session.get('searchBox')) {
      return 'search-active';
    } else {
      return '';
    }
  },
  unauthorizedProposal: function() {
    return Session.get('unauthorizedTags');
  },
  duplicateProposal: function() {
    return displayTimedWarning('duplicateProposals');
  }
});

Template.alternative.events({
  "keypress #searchInput": function (event) {
    if (Session.get('createProposal') && event.which == 13) {
      //addNewProposal();
      Modules.client.forkContract();
    }
    return event.which != 13;
  },
  "input #searchInput": function (event) {
    var content = document.getElementById("searchInput").innerHTML.replace(/&nbsp;/gi,'');
    ProposalSearch.search(content);

    if (ProposalSearch.getData().length == 0 && content != '') {
      Session.set('createProposal', true);
      Session.set('newProposal', content);
      var keyword = convertToSlug(content);
      var contract = Contracts.findOne( { keyword: keyword } );

      Meteor.clearTimeout(typingTimer);
      Session.set('proposalURLStatus', 'VERIFY');

      typingTimer = Meteor.setTimeout(function () {
        if (contract != undefined) {
            Session.set('proposalURLStatus', 'UNAVAILABLE');
        } else {
          Session.set('proposalURLStatus', 'AVAILABLE');
        }
      }, SERVER_INTERVAL);

    } else {
      Session.set('createProposal', false);
    }
  },
  "focus #searchInput": function (event) {
    document.getElementById("searchInput").innerHTML = '';
    Session.set('searchInput', true);
  },
  "blur #searchInput": function (event) {
    if (Session.get('createProposal') == false) {
      document.getElementById("searchInput").innerHTML = TAPi18n.__('search-input');
      Session.set('createProposal', false);
    }
    Session.set('searchInput', false);
  },
  "click #addNewProposal": function (event) {
    //addNewProposal();
    Modules.client.forkContract();
  }
});
