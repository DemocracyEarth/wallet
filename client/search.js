if (Meteor.isClient) {

  var searchHTMLElement = '#searchInput';

  Meteor.startup(function () {

    //Serch Engine for Tags
    var options = {
      keepHistory: 1000 * 60 * 5,
      localSearch: true
    };
    var fields = ['title', 'description'];

    Session.set('createProposal', false);
    ProposalSearch = new SearchSource('contracts', fields, options);

  });

  Template.search.rendered = function () {
    ProposalSearch.search('');
  }

  Template.search.helpers({
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

  Template.proposal.helpers({
    proposalURL: function (url) {
      if (url != undefined) {
        var pre = "<div class='data'><img src=" + Router.path('home') + "images/globe.png class='url-icon'><div class='verifier verifier-live'>&nbsp;";
        var post = "</div></div>";
        var host =  window.location.host;
        return pre + host + "<strong>" + url + "</strong>" + post;
      } else {
        return '';
      }
    },
    proposalDate: function (timestamp) {
      if (timestamp != undefined) {
        var pre = "<div class='data'><img src=" + Router.path('home') + "images/time.png class='url-icon'><div class='verifier verifier-live'>&nbsp;";
        var post = "</div>";
        var d = new Date;
        d = timestamp;
        return pre + d.format('{Month} {d}, {yyyy}') + post;
      } else {
        return '';
      }
    },
    briefDescription: function (descriptionText) {
      if (descriptionText == undefined || descriptionText == '') {
        return ''
      } else {
        return "<div class='rich-text rich-text-preview'>" + strip(descriptionText).replace(/(([^\s]+\s\s*){35})(.*)/,"$1…") + "</div>"
      }
    }
  });

  Template.search.events({
    "keypress #searchInput": function (event) {
      if (Session.get('createProposal') && event.which == 13) {
        addCustomTag(document.getElementById("searchInput").innerHTML.replace(/&nbsp;/gi,''));
        resetProposalSearch();
        document.getElementById("searchInput").innerHTML = '';
      }
      return event.which != 13;
    },
    "input #searchInput": function (event) {
      var content = document.getElementById("searchInput").innerHTML.replace(/&nbsp;/gi,'');
      ProposalSearch.search(content);

      if (ProposalSearch.getData().length == 0) {
        Session.set('createProposal', true);
        Session.set('newProposal', content);
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
        //resetProposalSearch();
      }
      Session.set('searchInput', false);
    }
  });

  Template.proposal.events({
    "click #add-custom-proposal": function (event) {
    },
    "click #add-suggested-proposal": function (event) {
      console.log('making the call for: ' + this._id);
      Meteor.call("addCustomForkToContract", Session.get('contractId'), this._id, function (error) {
          if (error && error.error == 'duplicate-fork') {
            Session.set('duplicateFork', true)
          }
      });
      Meteor.setTimeout(function () {document.getElementById('text-fork-proposal').value = '';},100);
    }
  });

}

resetProposalSearch = function () {
  //ProposalSearch.search('');
  document.getElementById("searchInput").innerHTML = TAPi18n.__('search-input');
  Session.set('createProposal', false);
}

strip = function (html) {
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}
