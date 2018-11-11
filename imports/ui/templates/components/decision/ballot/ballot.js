import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';
import { Router } from 'meteor/iron:router';

import { removeFork, updateBallotRank, addChoiceToBallot, getTickValue, getTotalVoters } from '/imports/ui/modules/ballot';
import { getContractToken } from '/imports/ui/templates/widgets/transaction/transaction';
import { displayTimedWarning } from '/lib/utils';
import { Contracts } from '/imports/api/contracts/Contracts';
import { timers } from '/lib/const';
import { verifyConstituencyRights, getTokenAddress, getTokenContractAddress, checkTokenAvailability } from '/imports/ui/templates/components/decision/electorate/electorate.js';
import { introEditor } from '/imports/ui/templates/widgets/compose/compose';
import { createContract } from '/imports/startup/both/modules/Contract';
import { transactWithMetamask, setupWeb3 } from '/imports/startup/both/modules/metamask';
import { formatCryptoValue } from '/imports/ui/templates/components/decision/balance/balance';
import { displayModal } from '/imports/ui/modules/modal';

import '/imports/ui/templates/components/decision/ballot/ballot.html';
import '/imports/ui/templates/components/decision/fork/fork.js';
import '/imports/ui/templates/components/decision/liquid/liquid.js';
import '/imports/ui/templates/widgets/warning/warning.js';

/**
* @summary executes token vote
*/
const _cryptoVote = () => {
  if (Meteor.user()) {
    if (Template.instance().voteEnabled) {
      if (setupWeb3(true)) {
        // metamask alert
        displayModal(
          true,
          {
            icon: 'images/metamask.png',
            title: TAPi18n.__('place-vote'),
            message: TAPi18n.__('metamask-confirm-transaction'),
            cancel: TAPi18n.__('close'),
            awaitMode: true,
          },
        );

        // prompt metamask
        console.log(Template.currentData().contract.blockchain.votePrice);
        transactWithMetamask(
          getTokenAddress(Meteor.user(), Template.instance().ticket.get().token),
          Template.currentData().contract.blockchain.publicAddress,
          Template.currentData().contract.blockchain.votePrice,
          Template.instance().ticket.get().token,
          getTokenContractAddress(Template.instance().ticket.get().token),
          Meteor.userId(),
          Template.currentData().contract._id,
        );
      }
    } else if (!checkTokenAvailability(Meteor.user(), Template.instance().ticket.get().token)) {
      // lack of token
      displayModal(
        true,
        {
          icon: 'images/olive.png',
          title: TAPi18n.__('place-vote'),
          message: TAPi18n.__('insufficient-votes'),
          action: TAPi18n.__('get-tokens'),
          cancel: TAPi18n.__('not-now'),
        },
        () => {
          window.open(Meteor.settings.public.web.sites.tokens, '_blank');
        }
      );
    } else {
      // wrong requisites
      displayModal(
        true,
        {
          icon: 'images/olive.png',
          title: TAPi18n.__('place-vote'),
          message: TAPi18n.__('incompatible-requisites'),
          cancel: TAPi18n.__('close'),
          alertMode: true,
        },
      );
    }
  } else {
    // not logged
    displayModal(
      true,
      {
        icon: 'images/olive.png',
        title: TAPi18n.__('place-vote'),
        message: TAPi18n.__('unlogged-cant-vote'),
        cancel: TAPi18n.__('close'),
        alertMode: true,
      },
    );
  }
};

/**
* @summary composes url to share stuff on twitter
* @param {object} contract to get data from
*/
const _getTwitterURL = (contract) => {
  return `https://twitter.com/share?url=${escape(window.location.origin)}${contract.url}&text=${contract.title}`;
};

/**
* @summary increases count of shares of a given post in db
* @param {string} _id of the contract
*/
const _countShare = (_id) => {
  const contract = Contracts.findOne({ _id });
  const shares = Session.get('sharedPosts');
  if (!shares) {
    Session.set('sharedPosts', [_id]);
  } else {
    for (const i in shares) {
      if (shares[i] === _id) {
        return;
      }
    }
    shares.push(_id);
    Session.set('sharedPosts', shares);
  }
  if (contract.shareCounter) {
    contract.shareCounter += 1;
  } else {
    contract.shareCounter = 1;
  }
  Contracts.update({ _id }, { $set: { shareCounter: contract.shareCounter } });
};

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

/**
* @summary counts votes
* @param {object} tally from contract
*/
const _count = (tally) => {
  return _.reduce(tally, function (memo, voter) {
    let votes = 0;
    let count;
    if (!memo.votes && memo.votes !== 0) { count = memo; } else { count = memo.votes; }
    votes = parseInt(count + voter.votes, 10);
    return votes;
  });
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

Template.ballot.onCreated(() => {
  Template.instance().forks = _generateForks(this.contract);
  Template.instance().emptyBallot = new ReactiveVar();
  Template.instance().ballotReady = new ReactiveVar();
  Template.instance().removeProposal = new ReactiveVar();
  Template.instance().contract = new ReactiveVar(Template.currentData().contract);
  Template.instance().ticket = new ReactiveVar(getContractToken({ contract: Template.currentData().contract, isButton: true }));
  Template.instance().voteEnabled = verifyConstituencyRights(Template.currentData().contract);
});

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
  canVote() {
    return Template.instance().voteEnabled;
  },
  voteType() {
    if (!this.contract.ballotEnabled && Template.instance().voteEnabled) {
      return 'single-vote';
    }
    return '';
  },
  voteURL() {
    if (!this.contract.ballotEnabled || !Template.instance().voteEnabled) {
      return '';
    }
    return this.contract.url;
  },
  voteIcon() {
    // if (!Template.instance().voteEnabled) {
    //  return 'images/vote-disabled.png';
    // }
    return 'images/vote.png';
  },
  enableStyle() {
    if (!Template.instance().voteEnabled) {
      return 'micro-button-disabled';
    }
    return '';
  },
  options() {
    let contractBallot;
    if (Session.get('dbContractBallot') === undefined) {
      if (this.contract) {
        contractBallot = this.contract.ballot;
      } else {
        contractBallot = undefined;
      }
    } else {
      contractBallot = Session.get('dbContractBallot');
    }

    const ballot = [];

    // NOTE: since this is a tricky algorithm, just make sure this stop here isn't making any unseen problems.
    if (contractBallot === undefined) {
      return ballot;
    }

    const keys = [];
    let k;
    let i;

    // warn if ballot is empty
    if (contractBallot.length === 0) {
      Template.instance().ballotReady.set(false);
    } else {
      Template.instance().ballotReady.set(true);
    }

    // sort by rank on db
    for (i = 0; i < contractBallot.length; i += 1) {
      if (contractBallot[i].rank) {
        keys.push(parseInt(contractBallot[i].rank, 10));
      }
    }
    keys.sort(function (a, b) {
      return a - b;
    });
    for (i = 0; i < keys.length; i += 1) {
      for (k = 0; k < contractBallot.length; k += 1) {
        if (contractBallot[k].rank === keys[i]) {
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
      const contract = Contracts.findOne({ _id: ballot[i]._id });
      if (contract !== undefined) {
        if (contract.stage === 'DRAFT') {
          ballot[i].url = `/vote/draft?id=${ballot[i]._id}`;
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
      // forks: _generateForks(this.contract),
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
    const contract = Contracts.findOne({ _id: this.contract._id });
    let label = '';
    switch (button) {
      case 'twitter':
        label = TAPi18n.__('tweet');
        break;
      case 'debate':
        label = TAPi18n.__('debate');
        break;
      case 'vote':
        label = `${TAPi18n.__('send')} &#183; `;
        if (contract) {
          if (contract.ballotEnabled) {
            label = TAPi18n.__('stake');
          } else {
            for (const i in contract.tally.voter) {
              if (contract.tally.voter[i]._id === Meteor.userId()) {
                label = TAPi18n.__('unvote');
                break;
              }
            }
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
    if (contract) {
      switch (button) {
        case 'twitter':
          label = `&#183; ${contract.shareCounter ? contract.shareCounter : '0'}`;
          break;
        case 'debate':
          if (contract) {
            let totalReplies;
            if (contract.totalReplies === undefined) {
              totalReplies = 0;
            } else {
              totalReplies = contract.totalReplies;
            }
            label = `&#183; ${(totalReplies)}`;
          }
          break;
        case 'vote':
          if (contract && contract.tally && contract.tally.choice.length > 1) {
            label = `&#183; ${_count(contract.tally.choice)}`;
          } else if (contract && contract.tally && contract.tally.voter.length > 1) {
            label += `&#183; ${_count(contract.tally.voter)}`;
          } else if (contract.tally && contract.tally.voter.length === 1) {
            label += `&#183; ${(contract.tally.voter[0].votes)}`;
          } else {
            label += '&#183; 0';
          }
          break;
        default:
      }
    }
    return label;
  },
  token() {
    return Template.instance().ticket.get();
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
  twitterURL() {
    return _getTwitterURL(this.contract);
  },
});

Template.ballot.events({
  'click #single-vote'(event) {
    event.preventDefault();
    _cryptoVote();
    // NOTE: non crypto implementation:
    // Session.set('castSingleVote', this.contract.keyword);
  },
  'click #edit-reply'(event) {
    event.preventDefault();
    if (Meteor.user()) {
      let contract = Session.get('draftContract');
      if (Meteor.Device.isPhone()) {
        if (!contract) {
          contract = createContract();
        }
        Session.set('draftContract', contract);
        introEditor({ desktopMode: !Meteor.Device.isPhone(), replyMode: true, replyId: Template.currentData().contract._id });
      } else if (Session.get('draftContract')) {
        contract.replyId = Template.currentData().contract._id;
        Session.set('draftContract', contract);
      } else {
        introEditor({ desktopMode: !Meteor.Device.isPhone(), replyMode: true, replyId: Template.currentData().contract._id });
      }
    } else {
      displayModal(
        true,
        {
          icon: 'images/olive.png',
          title: TAPi18n.__('reply'),
          message: TAPi18n.__('unlogged-cant-reply'),
          cancel: TAPi18n.__('close'),
          alertMode: true,
        },
      );
    }
  },
  'click #tweet-post'(event) {
    event.preventDefault();
    window.open(_getTwitterURL(this.contract));
    _countShare(this.contract._id);
  },
  'submit #fork-form, click #add-fork-proposal'(event) {
    event.preventDefault();
    addChoiceToBallot(this.contract._id, document.getElementById('text-fork-proposal').value);
    Meteor.setTimeout(() => { document.getElementById('text-fork-proposal').value = ''; }, 100);
  },
});
