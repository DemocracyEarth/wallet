import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { ReactiveVar } from 'meteor/reactive-var';

import { Contracts } from '/imports/api/contracts/Contracts';
import { setVote, candidateBallot, setBallot, getTally, getTallyPercentage } from '/imports/ui/modules/ballot';
import { Vote } from '/imports/ui/modules/Vote';

import '/imports/ui/templates/components/decision/fork/fork.html';

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

const _getElection = (fork) => {
  for (const i in fork.ballot) {
    if (fork.ballot[i]._id === fork._id) {
      return fork.ballot[i].election;
    }
  }
  return false;
};

Template.fork.onCreated(() => {
  Template.instance().candidateBallot = new ReactiveVar(Template.currentData().candidateBallot);
  Template.instance().percentage = new ReactiveVar();
  Template.instance().election = new ReactiveVar(_getElection(Template.currentData()));
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
    if (this.contract.stage === 'DRAFT' || this.mini === true) {
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
    if (this.contract.stage === 'DRAFT' || (this.rightToVote === false && this.contract.stage !== 'DRAFT')) {
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
        if ((parseInt((percentage * width) / 100, 10) > min) && this.displayResults) {
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
    if (this.contract.stage === 'DRAFT') {
      return 'disabled';
    }
    return '';
  },
  tickStatus() {
    Template.instance().election.set(_getElection(this));
    const election = Template.instance().election.get();
    if (election) {
      this.tick = election.tick;
      if (Session.get('showModal') && election.tick && election.onLedger && Session.get('displayModal').contract._id === this.contract._id) {
        this.tick = !election.tick;
      }
    }
    return this.tick;
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
    return this.displayResults;
  },
  showResult() {
    console.log(this);
    if (this.displayResults) {
      const percentage = Template.instance().percentage.get();
      let color = '#e6e6e6';
      if (percentage > 50) {
        color = '#ccbcda';
      }
      return `background-image: linear-gradient(90deg, ${color} ${Template.instance().percentage.get()}%, transparent 0)`;
    }
    return '';
  },
  resultBar() {
    let style;
    if (this.displayResults) {
      style = 'checkbox-result ';
      if (this.mode === 'REJECT') {
        style += 'unauthorized';
      }
      return style;
    }
    return '';
  },
  total() {
    if (this.contract.tally) {
      const tally = Contracts.findOne({ _id: this.contract._id }).tally;
      this.contract.tally = tally;
    }
    const total = getTally(this);
    Template.instance().percentage.set(parseInt(getTallyPercentage(this), 10));
    if (total !== 1) {
      return `<strong>${total}</strong> ${TAPi18n.__('votes')} (${Template.instance().percentage.get()}%)`;
    }
    return `<strong>${total}</strong> ${TAPi18n.__('vote')} (${Template.instance().percentage.get()}%)`;
  },
});

Template.fork.events({
  'click #ballotCheckbox'() {
    if (!Session.get('showModal')) {
      if (Meteor.user()) {
        switch (this.contract.stage) {
          case 'DRAFT':
          case 'FINISH':
            Session.set('disabledCheckboxes', true);
            break;
          case 'LIVE':
          default:
            if (this.rightToVote) {
              if (Template.instance().candidateBallot.get() === undefined || Template.instance().candidateBallot.get().length === 0) {
                Template.instance().candidateBallot.set(candidateBallot(Meteor.userId(), this.contract._id));
              }
              const previous = Template.instance().candidateBallot.get();
              const wallet = new Vote(Session.get(this.voteId), Session.get(this.voteId).targetId, this.voteId);
              const template = Template.instance();
              const election = Template.instance().election.get();
              wallet.inBallot = Session.get(this.voteId).inBallot;
              wallet.allocateQuantity = wallet.inBallot;
              wallet.allocatePercentage = parseFloat((wallet.inBallot * 100) / wallet.balance, 10).toFixed(2);
              let cancel = () => {
                template.candidateBallot.set(setBallot(this.contract._id, previous));
              };

              election.tick = setVote(this.contract, this);
              if (election.tick === true) {
                Session.set('noSelectedOption', this.voteId);
              }
              Template.instance().election.set(election);

              // vote
              if (election.tick === false && Session.get(this.voteId).inBallot > 0) {
                // remove all votes
                wallet.allocatePercentage = 0;
                wallet.allocateQuantity = 0;
                cancel = () => {
                  template.candidateBallot.set(setBallot(this.contract._id, []));
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
    Contracts.update(this.contract._id, { $pull: {
      ballot:
        { _id: this._id },
    } });
  },
});
