import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { removeFork, updateBallotRank, addChoiceToBallot } from '/imports/ui/modules/ballot';

var rank = 0;

Template.ballot.onRendered = function onRender() {
  rank = 0;
  if (!Session.get('contract')) { return; }
  if (Session.get('contract').stage === 'DRAFT') {
    // Dragable options
    this.$('#ballotOption, #proposalSuggestions').sortable({
      stop: function(e, ui) {
        var rankOrder = new Array();
        $('#ballotOption li').each(function( index ) {
          rankOrder.push($( this ).attr('value'));
        });
        updateBallotRank(Session.get('contract')._id, rankOrder);
        Session.set('removeProposal', false);
        if (rankOrder.length == 0) {
          Session.set('ballotReady', false);
          if (Session.get('executiveDecision') == false) {
            Session.set('emptyBallot', true);
          } else {
            Session.set('emptyBallot', false);
          }
        }
      },
      start: function (event, ui) {
        ui.helper.height(ui.helper.height() - 10);
        ui.helper.width(ui.helper.width());
        ui.placeholder.width(ui.helper.width());
        ui.placeholder.height(ui.helper.height());

        if (this.id == "ballotOption") {
          Session.set('removeProposal', true);
        }
      },
      receive: function (event, ui) {
        sortableIn = true;
      },
      over: function(e, ui) {
        sortableIn = true;
      },
      out: function(e, ui) {
        sortableIn = false;
      },
      beforeStop: function(e, ui) {
        if (sortableIn == false) {
          if (Session.get('removeProposal')) {
            removeFork(Session.get('contract')._id, ui.item.get(0).getAttribute('value'));
            ui.item.get(0).remove();
            Session.set('removeProposal', false);
          }
        }
      },
      revert: 0,
      cancel: '.nondraggable',
      tolerance: 'pointer',
      scroll: true,
      items: '> li',
      forceHelperSize: true,
      helper: 'clone',
      zIndex: 9999,
      placeholder: 'vote vote-placeholder',
    }).disableSelection();
  }
  // TODO: make ballot a toggable objetc
};

Template.ballot.helpers({
  //toggles
  allowForks: function () {
    //console.log('[ballot helper] allowForks in contract = ' + Session.get('contract').allowForks);
    return Session.get('contract').allowForks;
  },
  multipleChoice: function () {
    //console.log('[ballot helper] multipleChoice in contract = ' + Session.get('contract').multipleChoice);
    return Session.get('contract').multipleChoice;
  },
  executiveDecision: function () {
    if (Session.get('contract')) {
      if (Session.get('contract').executiveDecision == true) {
        Session.set('emptyBallot', false);
      } else {
        if (Session.get('ballotReady') == false) {
          Session.set('emptyBallot', true);
        }
      }
      return Session.get('contract').executiveDecision;
    }
  },
  options: function () {
    var contractBallot;
    if (Session.get('dbContractBallot') == undefined) {
      if (Session.get('contract')) {
        contractBallot = Session.get('contract').ballot;
      } else {
        contractBallot = undefined;
      }
    } else {
      contractBallot = Session.get('dbContractBallot');
    }

    var ballot = new Array();

    //NOTE: since this is a tricky algorithm, just make sure this stop here isn't making any unseen problems.
    if (contractBallot == undefined) {
      return ballot;
    }

    var keys = [],
        k, i, len;

    //warn if ballot is empty
    if (contractBallot.length == 0) {
      Session.set('ballotReady', false);
    } else {
      Session.set('ballotReady', true);
    };

    //sort by rank on db
    for (var i = 0; i < contractBallot.length; i++) {
      if (contractBallot[i].rank) {
        keys.push(parseInt(contractBallot[i].rank));
      }
    };
    keys.sort(function sortNumber(a,b) {
      return a - b;
    });
    for (i = 0; i < keys.length; i++) {
      for (k = 0; k < contractBallot.length; k++) {
        if (contractBallot[k].rank == keys[i]) {
          ballot[i] = contractBallot[k];
        }
      }
    }

    if (ballot.length > 0) {
      Session.set('emptyBallot', false);
    } else {
      if (Session.get('contract').executiveDecision == false) {
        Session.set('emptyBallot', true);
      }
    }

    //if draft, route to editor
    for (i in ballot) {
      var contract = Contracts.findOne({ _id: ballot[i]._id});
      if (contract != undefined) {
        if (contract.stage == 'DRAFT') {
          ballot[i].url = '/vote/draft?id=' + ballot[i]._id;
        }
      }
    }

    return ballot;
  },
  //warnings
  disabledCheckboxes: function () {
    return displayTimedWarning ('disabledCheckboxes');
  },
  backdating: function () {
    return displayTimedWarning ('backdating');
  },
  duplicateFork: function() {
    return displayTimedWarning ('duplicateFork');
  },
  emptyBallot: function () {
    return Session.get('emptyBallot');
  },
  draftOptions: function () {
    return Session.get('draftOptions');
  },
  ballotReady: function () {
    return Session.get('ballotReady');
  },
  //calendar
  datePicker: function () {
    $('#date-picker').datepicker();
  },
  unauthorizedFork: function () {
    return Session.get('unauthorizedFork');
  },
  validVoter: function () {
    //TODO Module to evaluate conditions that acitvate voting rights.
    return false;
  }
});


Template.ballot.events({
  "submit #fork-form, click #add-fork-proposal": function (event) {
    event.preventDefault();
    addChoiceToBallot(Session.get('contract')._id, document.getElementById('text-fork-proposal').value);
    Meteor.setTimeout(function () {document.getElementById('text-fork-proposal').value = '';},100);
  }
});


function verifyEmptyBallot (options) {
  if (options.length == 0) {
    if (Session.get('contract').executiveDecision == false) {
      Session.set('emptyBallot', true);
      return true;
    } else {
      Session.set('emptyBallot', false);
    }
  } else {
    Session.set('emptyBallot',false);
  }
  return false;
}
