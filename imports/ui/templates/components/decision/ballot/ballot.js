import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { removeFork, updateBallotRank, addChoiceToBallot, candidateBallot } from '/imports/ui/modules/ballot';
import { displayTimedWarning } from '/lib/utils';
import { Contracts } from '/imports/api/contracts/Contracts';

import './ballot.html';
import '../kind/kind.js';
import '../../../widgets/calendar/calendar.js';
import '../../../widgets/toggle/toggle.js';
import '../../../widgets/warning/warning.js';
import '../execute/execute.js';
import '../fork/fork.js';
import '../alternative/alternative.js';
import '../power/power.js';

function getVoterContractBond(object) {
  return Object.assign(object, {
    voteId: `vote-${Meteor.userId()}-${Session.get('contract')._id}`,
    wallet: Meteor.user().profile.wallet,
    sourceId: Meteor.userId(),
    targetId: Session.get('contract')._id,
  });
}

function activateDragging() {
  // Dragable options
  let sortableIn;
  this.$('#ballotOption, #proposalSuggestions').sortable({
    stop() {
      const rankOrder = [];
      $('#ballotOption li').each(function () {
        rankOrder.push($(this).attr('value'));
      });
      updateBallotRank(Session.get('contract')._id, rankOrder);
      Session.set('removeProposal', false);
      if (rankOrder.length === 0) {
        Session.set('ballotReady', false);
        if (Session.get('executiveDecision') === false) {
          Session.set('emptyBallot', true);
        } else {
          Session.set('emptyBallot', false);
        }
      }
    },
    start(event, ui) {
      ui.helper.height(ui.helper.height() - 10);
      ui.helper.width(ui.helper.width());
      ui.placeholder.width(ui.helper.width());
      ui.placeholder.height(ui.helper.height());

      if (this.id === 'ballotOption') {
        Session.set('removeProposal', true);
      }
    },
    receive() {
      sortableIn = true;
    },
    over() {
      sortableIn = true;
    },
    out() {
      sortableIn = false;
    },
    beforeStop(e, ui) {
      if (sortableIn === false) {
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

Template.ballot.onRendered = () => {
  if (!Session.get('contract')) { return; }
  if (Session.get('contract').stage === 'DRAFT') {
    activateDragging();
  } else if (Meteor.userId() !== undefined) {
    candidateBallot(Meteor.userId());
  }
};

Template.ballot.helpers({
  allowForks() {
    return Session.get('contract').allowForks;
  },
  ballotEnabled() {
    if (Session.get('contract').ballotEnabled) {
      activateDragging();
    }
    return Session.get('contract').ballotEnabled;
  },
  headerStyle() {
    if (this.editorMode && !Session.get('contract').ballotEnabled) {
      return 'paper-header-empty';
    }
    return '';
  },
  multipleChoice() {
    return Session.get('contract').multipleChoice;
  },
  executiveDecision() {
    if (Session.get('contract')) {
      if (Session.get('contract').executiveDecision === true) {
        Session.set('emptyBallot', false);
      } else if (Session.get('ballotReady') === false) {
        Session.set('emptyBallot', true);
      }
      return Session.get('contract').executiveDecision;
    }
    return '';
  },
  // NOTE: this algo is tricky af, i'm actually scared to touch it.
  options() {
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
          ballot[i].voteId = getVoterContractBond(this).voteId;
        }
      }
    }

    return ballot;
  },
  // warnings
  disabledCheckboxes() {
    return displayTimedWarning('disabledCheckboxes');
  },
  backdating() {
    return displayTimedWarning('backdating');
  },
  duplicateFork() {
    return displayTimedWarning('duplicateFork');
  },
  emptyBallot() {
    return Session.get('emptyBallot');
  },
  draftOptions() {
    return Session.get('draftOptions');
  },
  ballotReady() {
    return Session.get('ballotReady');
  },
  // calendar
  datePicker() {
    $('#date-picker').datepicker();
  },
  unauthorizedFork() {
    return Session.get('unauthorizedFork');
  },
  validVoter() {
    // TODO Module to evaluate conditions that acitvate voting rights.
    return false;
  },
  noSelectedOption() {
    return displayTimedWarning('noSelectedOption');
  },
  voteSettings() {
    return getVoterContractBond(this);
  },
});


Template.ballot.events({
  'submit #fork-form, click #add-fork-proposal'(event) {
    event.preventDefault();
    addChoiceToBallot(Session.get('contract')._id, document.getElementById('text-fork-proposal').value);
    Meteor.setTimeout(() => { document.getElementById('text-fork-proposal').value = ''; }, 100);
  },
});
