import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';
import { Contracts } from '/imports/api/contracts/Contracts';

import { setVote, getVote } from '/imports/ui/modules/ballot';
import './fork.html';

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
    if (Session.get('contract').stage === 'DRAFT' || this.mini === true) {
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
    switch (mode) {
      case 'AUTHORIZE':
        return 'vote-authorize nondraggable';
      case 'REJECT':
        return 'vote-authorize unauthorized nondraggable';
      case 'FORK':
      default:
        return 'vote vote-alternative';
    }
  },
  action() {
    if (this.authorized === false) {
      return 'undefined';
    }
    return '';
  },
  option(mode) {
    if (Session.get('contract').stage === 'DRAFT' || (Session.get('rightToVote') === false && Session.get('contract').stage !== 'DRAFT')) {
      return 'disabled';
    }
    switch (mode) {
      case 'AUTHORIZE':
        return '';
      case 'REJECT':
        return 'option-link unauthorized';
      default:
        return '';
    }
  },
  decision(mode) {
    switch (mode) {
      case 'REJECT':
        return 'option-link unauthorized';
      default:
        return '';
    }
  },
  caption(mode) {
    if (mode !== 'FORK') {
      return TAPi18n.__(mode);
    }
    return this.label;
  },
  tick() {
    if (Session.get('contract').stage === 'DRAFT') {
      return 'disabled';
    }
    return '';
  },
  tickStatus() {
    this.tick = getVote(Session.get('contract')._id, this._id);
    if (Session.get('candidateBallot')) {
      if (this.tick) {
        if (this.mode === 'REJECT') {
          return 'tick-active-unauthorized';
        }
        return 'tick-active';
      }
    } else if (Session.get('rightToVote') === false && Session.get('contract').stage !== 'DRAFT') {
      // already voted
      if (this.tick) {
        return 'tick-disabled';
      }
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
    console.log((this.mode === 'REJECT'));
    return (this.mode === 'REJECT');
  },
});


Template.fork.events({
  'click #ballotCheckbox'() {
    switch (Session.get('contract').stage && this.mini === false) {
      case 'DRAFT':
      case 'FINISH':
        Session.set('disabledCheckboxes', true);
        break;
      case 'LIVE':
      default:
        if (Session.get('rightToVote')) {
          this.tick = setVote(Session.get('contract')._id, this);
          if (this.tick === true) {
            Session.set('noSelectedOption', false);
          }
          break;
        }
    }
  },
  'click #remove-fork'() {
    // Meteor.call('removeFork', Session.get('contract')._id, this._id);
    Contracts.update(Session.get('contract')._id, { $pull: {
      ballot:
        { _id: this._id },
    } });
  },
});
