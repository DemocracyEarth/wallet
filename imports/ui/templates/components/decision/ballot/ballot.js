import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';
import { Router } from 'meteor/iron:router';

import { removeFork, updateBallotRank, addChoiceToBallot, getTickValue, getTotalVoters } from '/imports/ui/modules/ballot';
import { displayTimedWarning } from '/lib/utils';
import { Contracts } from '/imports/api/contracts/Contracts';
import { timers } from '/lib/const';

import '/imports/ui/templates/components/decision/ballot/ballot.html';
import '/imports/ui/templates/components/decision/fork/fork.js';
import '/imports/ui/templates/components/decision/liquid/liquid.js';
import '/imports/ui/templates/widgets/warning/warning.js';

const _userCanVote = (contract, forkId) => {
  const forks = Template.instance().forks;
  if (forks) {
    for (const i in forks) {
      if (forkId === undefined) {
        if (getTickValue(forks[i], contract).tick) {
          return true;
        }
      } else if (forks[i]._id === forkId) {
        return getTickValue(forks[i], contract);
      }
    }
  }
  return false;
};

const _generateForks = (contract) => {
  return [
    {
      executive: true,
      mode: 'AUTHORIZE',
      _id: 1,
      election: _userCanVote(contract, 1),
    },
    {
      executive: true,
      mode: 'REJECT',
      _id: 0,
      election: _userCanVote(contract, 0),
    },
  ];
};

function getVoterContractBond(object) {
  if (Meteor.user()) {
    return Object.assign(object, {
      voteId: `vote-${Meteor.userId()}-${object.contract._id}`,
      wallet: Meteor.user().profile.wallet,
      sourceId: Meteor.userId(),
      targetId: object.contract._id,
      forks: _generateForks(object.contract),
    });
  }
  return Object.assign(object, {
    voteId: `vote-0000000-${object.contract._id}`,
    wallet: undefined,
    sourceId: '0000000',
    targetId: object.contract._id,
  });
}

Template.ballot.onCreated(() => {
  Template.instance().forks = _generateForks(this.contract);
  Template.instance().emptyBallot = new ReactiveVar();
  Template.instance().ballotReady = new ReactiveVar();
  Template.instance().removeProposal = new ReactiveVar();
  Template.instance().contract = new ReactiveVar(Template.currentData().contract);
});

Template.ballot.onRendered(() => {
});

function activateDragging() {
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
        if (Template.currentData().contract.executiveDecision === false) {
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

Template.ballot.helpers({
  allowForks() {
    return this.contract.allowForks;
  },
  ballotEnabled() {
    if (this.contract.ballotEnabled) {
      // TODO: use this when dragging becomes a feature
      // activateDragging();
    }
    return this.contract.ballotEnabled;
  },
  headerStyle() {
    if (this.editorMode && !this.contract.ballotEnabled) {
      return 'paper-header-empty';
    }
    return '';
  },
  multipleChoice() {
    return this.contract.multipleChoice;
  },
  executiveDecision() {
    if (this.contract.executiveDecision) {
      Template.instance().emptyBallot.set(false);
    } else if (Template.instance().ballotReady.get()) {
      Template.instance().emptyBallot.set(true);
    }
    return this.contract.executiveDecision;
  },
  voted() {
    const contract = Contracts.findOne({ _id: this.contract._id });
    for (const i in contract.tally.voter) {
      if (contract.tally.voter[i]._id === Meteor.userId()) {
        return true;
      }
    }
    return false;
  },
  voteType() {
    if (!this.contract.ballotEnabled) {
      return 'single-vote';
    }
    return '';
  },
  voteURL() {
    if (!this.contract.ballotEnabled) {
      return '';
    }
    return this.contract.url;
  },
  // NOTE: this algo is tricky af, i'm actually scared to touch it.
  options() {
    var contractBallot;
    if (Session.get('dbContractBallot') == undefined) {
      if (this.contract) {
        contractBallot = this.contract.ballot;
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
    } else if (this.contract.executiveDecision === false) {
      Template.instance().emptyBallot.set(true);
    }


    // if draft, route to editor
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
    if (Session.get('noSelectedOption') === this.voteId) {
      return true;
    }
    return false;
  },
  voteSettings() {
    return getVoterContractBond(this);
  },
  revokeSettings() {
    return Object.assign(this, {
      voteId: `vote-${this.contract._id}-${Meteor.userId()}`,
      wallet: this.contract.wallet,
      sourceId: this.contract._id,
      targetId: Meteor.userId(),
      forks: _generateForks(this.contract),
    });
  },
  executionStatus() {
    return this.contract.executionStatus;
  },
  stageLabel() {
    return this.contract.stage;
  },
  closingDate() {
    return this.contract.closingDate;
  },
  ballotStyle() {
    if (this.feedMode) {
      return 'section-mobile-feed';
    }
    return '';
  },
  permanentElection() {
    return this.contract.permanentElection;
  },
  candidateBallot() {
    return this.candidateBallot;
  },
  readOnly() {
    // NOTE: it's all about context
    if (this.displayActions) {
      return true;
    }
    return (Router.current().route.options.name !== 'post');
  },
  label(button) {
    // Template.instance().contract.set(Template.currentData().contract);
    const contract = Contracts.findOne({ _id: this.contract._id });
    let label = '';
    switch (button) {
      case 'debate':
        label = TAPi18n.__('debate');
        break;
      case 'vote':
        label = TAPi18n.__('vote');
        for (const i in contract.tally.voter) {
          if (contract.tally.voter[i]._id === Meteor.userId()) {
            label = TAPi18n.__('unvote');
            break;
          }
        }
        break;
      default:
    }
    return label;
  },
  quantity(button) {
    const contract = Contracts.findOne({ _id: this.contract._id });
    let label = '';
    switch (button) {
      case 'debate':
        if (contract && contract.totalReplies) {
          label = `&#183; ${(contract.totalReplies)}`;
        }
        break;
      case 'vote':
        if (contract && contract.tally && contract.tally.choice.length > 1) {
          label = `&#183; ${_.reduce(contract.tally.choice, function (memo, voter) {
            let votes = 0;
            let count;
            if (!memo.votes && memo.votes !== 0) { count = memo; } else { count = memo.votes; }
            votes = parseInt(count + voter.votes, 10);
            return votes;
          })}`;
        } else if (contract.tally && contract.tally.voter.length === 1) {
          label += `&#183; ${(contract.tally.voter[0].votes)}`;
        } else {
          label += '&#183; 0';
        }
        break;
      default:
    }
    return label;
  },
  castSingleVote() {
    return (Session.get('castSingleVote') === this.contract.keyword);
  },
  voters() {
    let total;
    if (this.contract.tally) {
      total = this.contract.tally.voters.length;
    } else {
      total = getTotalVoters(this.contract);
      if (total === 1) {
        return `${total} ${TAPi18n.__('voter').toLowerCase()}.`;
      } else if (total === 0) {
        return TAPi18n.__('no-voters');
      }
    }
    return `${total} ${TAPi18n.__('voters').toLowerCase()}.`;
  },
  feedWarning() {
    const warnings = Session.get('feedWarning');
    for (const message in warnings) {
      if (warnings[message].voteId === this.voteId) {
        Meteor.setTimeout(() => {
          warnings.splice(message, 1);
          Session.set('feedWarning', warnings);
        }, timers.WARNING_DURATION);
        return warnings[message];
      }
    }
    return false;
  },
  displayBar() {
    if (_userCanVote(this.contract) === false) {
      return 'display:none';
    }
    return '';
  },
});


Template.ballot.events({
  'click #single-vote'(event) {
    event.preventDefault();
    Session.set('castSingleVote', this.contract.keyword);
  },
  'submit #fork-form, click #add-fork-proposal'(event) {
    event.preventDefault();
    addChoiceToBallot(this.contract._id, document.getElementById('text-fork-proposal').value);
    Meteor.setTimeout(() => { document.getElementById('text-fork-proposal').value = ''; }, 100);
  },
});
