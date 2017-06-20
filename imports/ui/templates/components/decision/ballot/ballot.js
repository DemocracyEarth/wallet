import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

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
import '../liquid/liquid.js';

function getVoterContractBond(object) {
  return Object.assign(object, {
    voteId: `vote-${Meteor.userId()}-${Template.instance().contract.get()._id}`,
    wallet: Meteor.user().profile.wallet,
    sourceId: Meteor.userId(),
    targetId: Template.instance().contract.get()._id,
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
      updateBallotRank(Template.instance().contract.get()._id, rankOrder);
      Template.instance().removeProposal.set(false);
      if (rankOrder.length === 0) {
        Template.instance().ballotReady.set(false);
        if (Session.get('executiveDecision') === false) {
          Template.instance().emptyBallot.set(true);
        } else {
          Template.instance().emptyBallot.set(false);
        }
      }
    },
    start(event, ui) {
      ui.helper.height(ui.helper.height() - 10);
      ui.helper.width(ui.helper.width());
      ui.placeholder.width(ui.helper.width());
      ui.placeholder.height(ui.helper.height());

      if (this.id === 'ballotOption') {
        Template.instance().removeProposal.set(true);
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
        if (Template.instance().removeProposal.get()) {
          removeFork(Template.instance().contract.get()._id, ui.item.get(0).getAttribute('value'));
          ui.item.get(0).remove();
          Template.instance().removeProposal.set(false);
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


Template.ballot.onCreated(() => {
  if (!Session.get('contract')) {
    Template.instance().contract = new ReactiveVar(Template.currentData().contract);
  } else {
    Template.instance().contract = new ReactiveVar(Contracts.findOne({ _id: Session.get('contract')._id }));
  }

  Template.instance().dbContractBallot = new ReactiveVar();
  Template.instance().emptyBallot = new ReactiveVar();
  Template.instance().ballotReady = new ReactiveVar();
  Template.instance().removeProposal = new ReactiveVar();
  Template.instance().draftOptions = new ReactiveVar(); // not set here
  Template.instance().unauthorizedFork = new ReactiveVar(); // not set here
  Template.instance().executiveDecision = new ReactiveVar(); // not set here
});


Template.ballot.onRendered(() => {
  if (Template.instance().contract.get().stage === 'DRAFT') {
    activateDragging();
  } else if (Meteor.userId() !== undefined) {
    candidateBallot(Meteor.userId(), Template.instance().contract.get()._id);
  }
});

Template.ballot.helpers({
  allowForks() {
    return Template.instance().contract.get().allowForks;
  },
  ballotEnabled() {
    if (Template.instance().contract.get().ballotEnabled) {
      activateDragging();
    }
    return Template.instance().contract.get().ballotEnabled;
  },
  headerStyle() {
    if (this.editorMode && !Template.instance().contract.get().ballotEnabled) {
      return 'paper-header-empty';
    }
    return '';
  },
  multipleChoice() {
    return Template.instance().contract.get().multipleChoice;
  },
  executiveDecision() {
    if (Template.instance().contract.get().executiveDecision) {
      Template.instance().emptyBallot.set(false);
    } else if (Template.instance().ballotReady.get()) {
      Template.instance().emptyBallot.set(true);
    }
    return Template.instance().contract.get().executiveDecision;
  },
  // NOTE: this algo is tricky af, i'm actually scared to touch it.
  options() {
    var contractBallot;
    if (Session.get('dbContractBallot') == undefined) {
      if (Template.instance().contract.get()) {
        contractBallot = Template.instance().contract.get().ballot;
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
    if (contractBallot.length === 0) {
      Template.instance().ballotReady.set(false);
    } else {
      Template.instance().ballotReady.set(true);
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
      Template.instance().emptyBallot.set(false);
    } else if (Template.instance().contract.get().executiveDecision === false) {
      Template.instance().emptyBallot.set(true);
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
    return Template.instance().emptyBallot.get();
  },
  draftOptions() {
    return Session.get('draftOptions');
  },
  ballotReady() {
    return Template.instance().ballotReady.get();
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
  executionStatus() {
    return Template.instance().contract.get().executionStatus;
  },
  stageLabel() {
    return Template.instance().contract.get().stage;
  },
  closingDate() {
    return Template.instance().contract.get().closingDate;
  },
  ballotStyle() {
    if (this.feedMode) {
      return 'section-mobile-feed';
    }
    return '';
  },
  permanentElection() {
    return Template.instance().contract.get().permanentElection;
  },
});


Template.ballot.events({
  'submit #fork-form, click #add-fork-proposal'(event) {
    event.preventDefault();
    addChoiceToBallot(Template.instance().contract.get()._id, document.getElementById('text-fork-proposal').value);
    Meteor.setTimeout(() => { document.getElementById('text-fork-proposal').value = ''; }, 100);
  },
});
