import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';

import { Contracts } from '/imports/api/contracts/Contracts';
import { rules, timers } from '/lib/const';
import { placeCaretAtEnd } from '/imports/startup/both/modules/utils';
import { initEditor } from '/imports/ui/modules/editor';
import { stripHTMLfromText } from '/imports/ui/modules/utils';
import { URLCheck, URLVerifier } from '/imports/ui/modules/Files';
import { displayNotice } from '/imports/ui/modules/notice';

let typingTimer; // timer identifier

Template.title.onRendered = function onRendered() {
  initEditor();

  //TODO: figure out how to make tab work properly on first try.

  //tab focus next object
  $('#titleContent').on('focus', function(e){
    $(window).keyup(function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 9) {
            $('#editor').focus();
        }
    });
  });

  //paste
  document.getElementById('titleContent').addEventListener("paste", function(e) {
    e.preventDefault();
    var text = stripHTMLfromText(e.clipboardData.getData("text/plain"));
    var newtitle = $('#titleContent')[0].innerText;
    var delta = parseInt(rules.TITLE_MAX_LENGTH - newtitle.length);
    if (delta > 0) {
      document.execCommand("insertHTML", false, text);
     }
  });

};

Template.titleContent.helpers({
  sampleMode: function() {
    if (Session.get('missingTitle')) {
      return 'sample';
    } else {
      return '';
    }
  },
  declaration: function() {
    return getTitle();
  },
  editable: function () {
    var html = "<div id='titleContent' contenteditable='true' tabindex=0>" + this.toString() + "</div>";
    return html;
  }
})

// Title of Contract
Template.title.helpers({
  blockchainAddress: function () {
    return '';
  },
  declaration: function() {
    return getTitle();
  },
  contractURL: function () {
    var host =  window.location.host;
    var keyword = '';

    if (Session.get('contract')) {
      if (Session.get('contractKeyword') == undefined) {
        Session.set('contractKeyword', Session.get('contract').keyword);
      } else if (Session.get('contractKeyword') != Session.get('contract').keyword) {
        keyword = Session.get('contractKeyword');
      } else {
        keyword = Session.get('contract').keyword;
      }

      return host + "/" + Session.get('contract').kind.toLowerCase() + "/<strong>" + keyword + "</strong>";
    }
  },
  missingTitle: function () {
    if (Session.get('missingTitle')) {
      Session.set('URLStatus', 'UNAVAILABLE');
    }
    if ($('#titleContent').is(":focus")) {
      Session.set('URLStatus', 'NONE');
    }
    if (!Session.get('firstEditorLoad')) {
      return Session.get('missingTitle');
    }
  },
  mistypedTitle: function () {
    return Session.get('mistypedTitle');
  },
  URLStatus: function () {
    return URLCheck('URLStatus');
  },
  verifierMode: function () {
    return URLVerifier('URLStatus');
  },
  duplicateURL: function () {
    return Session.get('duplicateURL');
  },
  timestamp: function () {
    if (Session.get('contract')) {
      var d = new Date;
      if (Session.get('contract').timestamp != undefined) {
        d = Session.get('contract').timestamp;
        return d.format('{Month} {d}, {yyyy}');
      }
    }
  },
  executionStatus: function () {
    if (Session.get('contract') != undefined) {
      return Session.get('contract').executionStatus;
    }
  },
  stageLabel: function () {
    if (Session.get('contract') != undefined) {
      return Session.get('contract').stage;
    }
  },
  closingDate: function () {
    if (Session.get('contract') != undefined) {
      return Session.get('contract').closingDate;
    }
  }
});


Template.titleContent.events({
  "input #titleContent": function (event) {
    var content = document.getElementById("titleContent").innerText;//jQuery($("#titleContent").html()).text();
    var keyword = convertToSlug(content);
    var contract = Contracts.findOne( { keyword: keyword } );

    //Set timer to check upload to db
    Meteor.clearTimeout(typingTimer);
    Session.set('contractKeyword', keyword);
    Session.set('URLStatus', 'VERIFY');

    if (Session.get('firstEditorLoad')) {
      var currentTitle = document.getElementById("titleContent").innerText;
      var newTitle = currentTitle.replace(TAPi18n.__('no-title'), '');
      document.getElementById("titleContent").innerText = newTitle;
      placeCaretAtEnd(document.getElementById("titleContent"));
      Session.set('firstEditorLoad', false);
    }

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
      if (contract != undefined && contract._id != Session.get('contract')._id) {
          Session.set('URLStatus', 'UNAVAILABLE');
      } else {
        if (Contracts.update({_id : Session.get('contract')._id }, { $set: { title: content, keyword: keyword, url: "/" + Session.get('contract').kind.toLowerCase() + "/" + keyword }})) {
          Session.set('URLStatus', 'AVAILABLE');
        };
        displayNotice(TAPi18n.__('saved-draft-description'), true);
      }
    }, timers.SERVER_INTERVAL);

  },
  "keypress #titleContent": function (event) {
    var content = document.getElementById("titleContent").innerText;
    return (content.length <= rules.TITLE_MAX_LENGTH) && event.which != 13 && event.which != 9;
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

//returns the title from the contract
function getTitle () {
  var contract = Contracts.findOne( { _id: contractId }, { reactive: false } )
  if (!contract) { return };
  var title = contract.title;
  if (title == '' || title == undefined) {
    Session.set('missingTitle', true);
    return TAPi18n.__('no-title');
  } else {
    Session.set('missingTitle', false);
    return title;
  }
}
