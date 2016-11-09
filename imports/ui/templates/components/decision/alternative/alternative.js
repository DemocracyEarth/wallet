import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';

import { convertToSlug, displayTimedWarning } from '/lib/utils';
import { URLCheck, URLVerifier } from '/imports/ui/modules/Files';
import { Contracts } from '/imports/api/contracts/Contracts';
import { forkContract } from '/imports/ui/modules/ballot';
import { timers } from '/lib/const';
import { ProposalSearch } from '/lib/global';

import './alternative.html';
import '../../../widgets/feed/feedItem.js';
import '../stage/stage.js';

const searchHTMLElement = '#searchInput';
let typingTimer;
let SEARCH_INPUT;

Template.alternative.onRendered = function onRender() {
  SEARCH_INPUT = TAPi18n.__('search-input');
  ProposalSearch.search('');
  _generateAlternativeFeed();
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
    if (document.getElementById("searchInput") != undefined) {
      var content = document.getElementById("searchInput").innerText;
    } else {
      content = '';
    }

    _generateAlternativeFeed();

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

    //purge if same from current contract
    for (i in search) {
      if (search[i]._id == Session.get('contract')._id) {
        search.splice(i, 1);
        break;
      }
    }

    if (convertToSlug(content).length <= 1 || search.length == 0) {
      search = Session.get('alternativeFeed');
    }

    if (search.length == 0 && content != '') {
      if (content !== SEARCH_INPUT) {
        instaProposalCreator(content);
      }
    }
    return search;
  },
  emptyAlternatives: function () {
    return displayElement('emptyAlternatives');
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
    var host = window.location.host;
    var keyword = convertToSlug(Session.get('newProposal'));

    return host + "/" + Session.get('contract').kind.toLowerCase() + "/"  +  "<strong>" + keyword + "</strong>";
  },
  URLStatus: function () {
    return URLCheck('proposalURLStatus');
  },
  verifierMode: function () {
    return URLVerifier('proposalURLStatus');
  },
  newProposalTimestamp: function () {
    var d = new Date;
    return d.format('{Month} {d}, {yyyy}');
  },
  newProposalStatus: function () {
    switch (Session.get("proposalURLStatus")) {
      case 'VERIFY':
      case 'UNAVAILABLE':
        return 'action-search-disabled';
      case 'AVAILABLE':
        return '';
    }
  },
  emptyList: function () {
    if (Contracts.findOne( { _id: Session.get('contract')._id } ).tags.length == 0) {
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
  },
  addBallot: function () {
    switch (Session.get("proposalURLStatus")) {
      case 'VERIFY':
      case 'UNAVAILABLE':
        return 'disabled';
      case 'AVAILABLE':
        return ''
      }
  }
});

Template.alternative.events({
  "keypress #searchInput": function (event) {
    if (Session.get('createProposal') && event.which == 13) {
      forkContract();
    }
    return event.which != 13;
  },
  "input #searchInput": function (event) {
    var content = document.getElementById("searchInput").innerHTML.replace(/&nbsp;/gi,'');
    ProposalSearch.search(content);
    if (ProposalSearch.getData().length == 0 && content != '') {
      instaProposalCreator(content);
      _generateAlternativeFeed();
    } else {
      if (ProposalSearch.getData().length == 1) {
        if (ProposalSearch.getData()[0]._id == Session.get('contract')._id) {
          instaProposalCreator(content);
          _generateAlternativeFeed();
        } else {
          Session.set('createProposal', false);
          Session.set('emptyAlternatives', false);
        }
      } else {
        Session.set('createProposal', false);
        _generateAlternativeFeed();
      }
    }
    if (convertToSlug(content).length <= 2) {
      Session.set('createProposal', false);
    }
  },
  "focus #searchInput": function (event) {
    document.getElementById("searchInput").innerHTML = '';
    Session.set('searchInput', true);
  },
  "blur #searchInput": function (event) {
    if (Session.get('createProposal') == false) {
      document.getElementById("searchInput").innerHTML = SEARCH_INPUT;
      Session.set('createProposal', false);
    }
    Session.set('searchInput', false);
  },
  "click #addNewProposal": function (event) {
    forkContract();
  }
});

function instaProposalCreator(content) {
  if (Session.get('alternativeFeed').length > 0) {
    if (convertToSlug(content).length <= 1) {
      Session.set('createProposal', false);
      return;
    }
  }

  Session.set('createProposal', true);
  Session.set('newProposal', content);
  var keyword = convertToSlug(content);
  var contract = Contracts.findOne({ keyword });

  Meteor.clearTimeout(typingTimer);
  Session.set('proposalURLStatus', 'VERIFY');

  typingTimer = Meteor.setTimeout(function () {
    if (contract != undefined) {
        Session.set('proposalURLStatus', 'UNAVAILABLE');
    } else {
      Session.set('proposalURLStatus', 'AVAILABLE');
    }
  }, timers.SERVER_INTERVAL);

}

function _generateAlternativeFeed () {
  Session.set('alternativeFeed', Contracts.find({ $or: [ {collectiveId: Session.get('collective')._id, stage : { $not : STAGE_DRAFT } }, {owner: Meteor.user()._id , _id : { $not : Session.get('contract')._id }} ] }).fetch());
  if (Session.get('alternativeFeed').length > 0) {
    Session.set('emptyAlternatives', false);
  } else {
    Session.set('emptyAlternatives', true);
  }
}
