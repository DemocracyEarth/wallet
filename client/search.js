if (Meteor.isClient) {

  var searchHTMLElement = '#searchInput';
  var typingTimer; //timer identifier

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
    newProposalURL: function () {
      var pre = "<div class='data'><img src=" + Router.path('home') + "images/globe.png class='url-icon'><div class='verifier verifier-live'>&nbsp;";
      var post = "</span></div>";
      var host =  window.location.host;
      var keyword = convertToSlug(Session.get('newProposal'));
      var status = "";

      switch (Session.get("proposalURLStatus")) {
        case "VERIFY":
          status =  "&nbsp;<span class='state verifying'>" + TAPi18n.__('url-verify');
          break;
        case "UNAVAILABLE":
          //Session.set('duplicateURL', true);
          status = "&nbsp;<span class='state unavailable'>" + TAPi18n.__('url-unavailable');
          break;
        case "AVAILABLE":
          //Session.set('duplicateURL', false);
          status = "&nbsp;<span class='state available'>" + TAPi18n.__('url-available');
          break;
      }
      return pre + host + "<strong>" + "/" + Session.get('kind') + "/" + keyword + "</strong></div>" + status + post;
    },
    newProposalTimestamp: function () {
      var d = new Date;
      var pre = "<div class='data'><img src=" + Router.path('home') + "images/time.png class='url-icon'><div class='verifier verifier-live'>&nbsp;";
      var post = "</div>";
      return pre + d.format('{Month} {d}, {yyyy}') + post;
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
        addNewProposal();
      }
      return event.which != 13;
    },
    "input #searchInput": function (event) {
      var content = document.getElementById("searchInput").innerHTML.replace(/&nbsp;/gi,'');
      ProposalSearch.search(content);

      if (ProposalSearch.getData().length == 0) {
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
        resetProposalSearch();
      }
      Session.set('searchInput', false);
    }
  });

  Template.search.events({
    "click #addNewProposal": function (event) {
      addNewProposal();
    }
  });

  Template.proposal.events({
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

addNewProposal = function () {
  console.log('adding new proposal ' + Session.get('proposalURLStatus'));
  if (Session.get('proposalURLStatus') == 'AVAILABLE') {
    console.log(convertToSlug(Session.get('newProposal')));

    Meteor.call("createNewContract", Session.get('newProposal'), function (error, data) {
      if (error && error.error == 'duplicate-fork') {
        Session.set('duplicateFork', true)
      } else {
        Meteor.call("addCustomForkToContract", Session.get('contractId'), data, function (error) {
            if (error && error.error == 'duplicate-fork') {
              Session.set('duplicateFork', true)
            } else {
              ProposalSearch.search('');
              Session.set('proposalURLStatus', 'UNAVAILABLE');
              resetProposalSearch();
            }
        });
      }
    });
  }
}

resetProposalSearch = function () {
  document.getElementById("searchInput").innerHTML = TAPi18n.__('search-input');
  Session.set('createProposal', false);
}

strip = function (html) {
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}
