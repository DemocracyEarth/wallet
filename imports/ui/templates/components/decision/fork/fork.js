import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';

import { setVote, getVote } from '/imports/ui/modules/ballot';
import './fork.html';

Template.fork.helpers({
  length: function () {
    if (this.label !== undefined) {
      if (this.label.length > 51) {
        return 'option-link option-long option-longest';
      } else if (this.label.length > 37) {
        return 'option-link option-long';
      } else {
        return '';
      }
    };
    return '';
  },
  dragMode: function () {
    if (Session.get('contract').stage === 'DRAFT') {
      return '';
    } else {
      return 'vote-nondrag';
    }
  },
  tickStyle: function () {
    if (this.mode === 'REJECT') {
      return 'unauthorized';
    }
  },
  checkbox: function (mode) {
    switch (mode) {
      case 'AUTHORIZE':
        return 'vote-authorize nondraggable';
      case 'REJECT':
        return 'vote-authorize unauthorized nondraggable';
      case 'FORK':
        return 'vote vote-alternative';
    }
  },
  action: function () {
      if (this.authorized == false) {
        return 'undefined';
      }
  },
  option: function (mode) {
    if (Session.get('contract').stage == 'DRAFT' || ( Session.get('rightToVote') == false && Session.get('contract').stage != 'DRAFT' )) {
      return 'disabled';
    } else {
      switch (mode) {
        case 'AUTHORIZE':
          return '';
        case 'REJECT':
          return 'option-link';
        default:
          return '';
      }
    }
  },
  decision: function (mode) {
    switch (mode) {
      case 'REJECT':
        return 'option-link unauthorized';
      default:
        return '';
    }
  },
  caption: function (mode) {
    if (mode != 'FORK') {
      return TAPi18n.__(mode);
    } else {
      return this.label;
    }
  },
  tick: function () {
    if (Session.get('contract').stage == 'DRAFT') {
      return 'disabled'
    }
  },
  tickStatus: function () {
    this.tick = getVote(Session.get('contract')._id, this._id);
    if (Session.get('candidateBallot')) {
      if (this.tick) {
        if (this.mode === 'REJECT') {
          return 'tick-active-unauthorized';
        } else {
          return 'tick-active';
        }
      }
    } else if (Session.get('rightToVote') === false && Session.get('contract').stage !== 'DRAFT') {
      //already voted
      if (this.tick) {
        return 'tick-disabled'
      }
    }
    return '';
  }
});


Template.fork.events({
  'click #ballotCheckbox'() {
    switch (Session.get('contract').stage) {
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
    Meteor.call('removeFork', Session.get('contract')._id, this._id);
  },
});
