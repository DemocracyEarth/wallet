import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { ReactiveVar } from 'meteor/reactive-var';

import { Contracts } from '/imports/api/contracts/Contracts';
import { setVote, getTickValue, candidateBallot, getRightToVote, getBallot, setBallot, getTotalVoters, getTally, getTallyPercentage } from '/imports/ui/modules/ballot';
import { Vote } from '/imports/ui/modules/Vote';
import { displayModal } from '/imports/ui/modules/modal';

import './fork.html';

/**
* @summary determines whether this decision can display results or notice
* @return {boolean} yes or no
*/
const _displayResults = (contract) => {
  if (getTotalVoters(contract) > 0) {
    return ((contract.stage === 'FINISH') || (contract.permanentElection && contract.stage !== 'DRAFT'));
  }
  return false;
};

/**
* @summary color to render the checkbox
* @param {string} mode current mode of the checkbox
*/
const _checkboxStyle = (mode) => {
  switch (mode) {
    case 'AUTHORIZE':
      return 'vote-authorize nondraggable';
    case 'REJECT':
      return 'vote-authorize unauthorized nondraggable';
    case 'FORK':
    default:
      return 'vote vote-alternative';
  }
};

/**
* @summary color to render the result bar
* @param {string} mode current mode of the checkbox
*/
const _modeColor = (mode) => {
  if (mode === 'REJECT') {
    return '#fdc5c5';
  }
  return '#b7f3e1';
};

Template.fork.onCreated(() => {
  Template.instance().contract = new ReactiveVar(Template.currentData().contract);
  Template.instance().rightToVote = new ReactiveVar(getRightToVote(Template.instance().contract.get()));
  Template.instance().candidateBallot = new ReactiveVar(getBallot(Template.instance().contract.get()._id));
  Template.instance().percentage = new ReactiveVar();
  Template.instance().displayResults = new ReactiveVar(false);
});

Template.fork.helpers({
  length() {
    if (this.label !== undefined) {
      if (this.label.length > 51) {
        return 'option-link option-long option-longest';
      } else if (this.label.length > 37) {
        return 'option-link option-long';
      }
    }
    return '';
  },
  dragMode() {
    if (Template.instance().contract.get().stage === 'DRAFT' || this.mini === true) {
      return '';
    }
    return 'vote-nondrag';
  },
  tickStyle() {
    if (this.mode === 'REJECT') {
      return 'unauthorized';
    }
    return '';
  },
  checkbox(mode) {
    return _checkboxStyle(mode);
  },
  action() {
    if (this.authorized === false) {
      return 'undefined';
    }
    return '';
  },
  option(mode) {
    if (Template.instance().contract.get().stage === 'DRAFT' || (Template.instance().rightToVote.get() === false && Template.instance().contract.get().stage !== 'DRAFT')) {
      return 'disabled';
    }
    switch (mode) {
      case 'AUTHORIZE':
        return '';
      case 'REJECT':
        if (this.mini) {
          return 'unauthorized';
        }
        return 'option-link unauthorized';
      default:
        return '';
    }
  },
  highlight(div) {
    if (document.querySelector(`#fork-${this.voteId}-${this._id}`)) {
      const width = document.querySelector(`#fork-${this.voteId}-${this._id}`).offsetWidth;
      const percentage = Template.instance().percentage.get();
      let min = 35;
      if (div === 'result-total') { min = parseInt(width - 66, 10); }
      if (percentage) {
        if ((parseInt((percentage * width) / 100, 10) > min) && Template.instance().displayResults.get()) {
          return 'color: #fff';
        }
      }
    }
    return '';
  },
  decision(mode) {
    let style;
    switch (mode) {
      case 'REJECT':
        style = ' unauthorized';
        break;
      default:
        style = '';
    }
    return style;
  },
  caption(mode) {
    if (mode !== 'FORK') {
      return TAPi18n.__(mode);
    }
    return this.label;
  },
  tick() {
    if (Template.instance().contract.get().stage === 'DRAFT') {
      return 'disabled';
    }
    return '';
  },
  tickStatus() {
    const election = getTickValue(this, Template.instance().contract.get());
    this.tick = election.tick;
    if (Session.get('showModal') && election.tick && election.onLedger && Session.get('displayModal').contract._id === this.contract._id) {
      this.tick = !election.tick;
    }
    const execution = $(`#execution-${this.voteId}`);

    // display liquid bar
    if (execution.length > 0 && execution.height() === 0) {
      if (this.tick || election.alternative) {
        $(execution).velocity({ height: `${115}px` });
      }
    }

    // show tick
    if (Template.instance().candidateBallot.get() || (this.tick)) {
      if (this.tick) {
        if (this.mode === 'REJECT') {
          return 'tick-active-unauthorized';
        }
        return 'tick-active';
      }

    // if user already voted
    } else if (Template.instance().rightToVote.get() === false && Template.instance().contract.get().stage !== 'DRAFT') {
      if (this.tick) {
        return 'tick-disabled';
      }
    }

    // hide liquid bar
    if ((execution.length > 0 && execution.height() !== 0) && !election.alternative) {
      $(execution).velocity({ height: `${0}px` });
    }
    return '';
  },
  style(className) {
    let final = className;
    if (this.mini === true) {
      final += ` ${final}-mini`;
    }
    return final;
  },
  isReject() {
    return (this.mode === 'REJECT');
  },
  displayResult() {
    Template.instance().displayResults.set(_displayResults(Template.instance().contract.get()));
    return Template.instance().displayResults.get();
  },
  showResult() {
    if (Template.instance().displayResults.get()) {
      return `background-image: linear-gradient(90deg, ${_modeColor(this.mode)} ${Template.instance().percentage.get()}%, transparent 0)`;
    }
    return '';
  },
  resultBar() {
    let style;
    if (Template.instance().displayResults.get()) {
      style = 'checkbox-result ';
      if (this.mode === 'REJECT') {
        style += 'unauthorized';
      }
      return style;
    }
    return '';
  },
  total() {
    const total = getTally(this);
    Template.instance().percentage.set(parseInt(getTallyPercentage(this), 10));
    if (total !== 1) {
      return `<strong>${total}</strong> ${TAPi18n.__('votes')} (${Template.instance().percentage.get()}%)`;
    }
    return `<strong>${total}</strong> ${TAPi18n.__('vote')} (${Template.instance().percentage.get()}%)`;
  },
});

/**
* @summary animates the percentage bar according to percentage value
* @param {string} identifier DOM ID to animates
* @param {number} percentage integer with percentage value
*/
const _animateBar = (identifier, percentage) => {
  $(identifier).velocity({ width: `${percentage}%` });
};

Template.fork.events({
  'click #ballotCheckbox'() {
    if (!Session.get('showModal')) {
      if (Meteor.user()) {
        switch (Template.instance().contract.get().stage) {
          case 'DRAFT':
          case 'FINISH':
            Session.set('disabledCheckboxes', true);
            break;
          case 'LIVE':
          default:
            if (Template.instance().rightToVote.get()) {
              if (Template.instance().candidateBallot.get() === undefined || Template.instance().candidateBallot.get().length === 0) {
                Template.instance().candidateBallot.set(candidateBallot(Meteor.userId(), Template.instance().contract.get()._id));
              }
              const previous = Template.instance().candidateBallot.get();
              const wallet = new Vote(Session.get(this.voteId), Session.get(this.voteId).targetId, this.voteId);
              const template = Template.instance();
              wallet.inBallot = Session.get(this.voteId).inBallot;
              wallet.allocateQuantity = wallet.inBallot;
              wallet.allocatePercentage = parseFloat((wallet.inBallot * 100) / wallet.balance, 10).toFixed(2);
              let cancel = () => {
                template.candidateBallot.set(setBallot(template.contract.get()._id, previous));
              };
              this.tick = setVote(Template.instance().contract.get(), this);
              if (this.tick === true) {
                Session.set('noSelectedOption', this.voteId);
              }

              // vote
              if (this.tick === false && Session.get(this.voteId).inBallot > 0) {
                // remove all votes
                wallet.allocatePercentage = 0;
                wallet.allocateQuantity = 0;
                cancel = () => {
                  template.candidateBallot.set(setBallot(template.contract.get()._id, []));
                };
                wallet.execute(cancel, true);
                return;
              } else if (Session.get(this.voteId).inBallot > 0) {
                // send new ballot
                wallet.execute(cancel);
              }
              break;
            }
        }
      } else {
        const warnings = [];
        if (Session.get('feedWarning')) {
          warnings.push(Session.get('feedWarning'));
        }
        warnings.push({
          voteId: this.voteId,
          label: 'unlogged-cant-vote',
        });
        Session.set('feedWarning', warnings);
      }
    }
  },
  'click #remove-fork'() {
    Contracts.update(Template.instance().contract.get()._id, { $pull: {
      ballot:
        { _id: this._id },
    } });
  },
});
