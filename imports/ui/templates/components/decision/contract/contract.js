import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';

import { splitRender } from '/imports/ui/modules/split';

import './contract.html';
import '../title/title.js';
import '../agreement/agreement.js';
import '../semantics/semantics.js';
import '../signatures/signatures.js';
import '../vote/vote.js';
import '../ballot/ballot.js';
import '../action/action.js';
import '../results/results.js';
import '../agora/agora.js';

Template.contract.onRendered(() => {
  // set pixel width of left and right split panels
  splitRender();
});

Template.contract.helpers({
  editorMode() {
    if (Session.get('contract')) {
      return (Session.get('contract').stage === 'DRAFT');
    }
    return undefined;
  },
  isDelegation() {
    if (Session.get('contract')) {
      return (Session.get('contract').kind === 'DELEGATION');
    }
    return undefined;
  },
  pollClosed() {
    if (Session.get('contract')) {
      return (Session.get('contract').stage === 'FINISH');
    }
    return undefined;
  },
  ballotToggle() {
    if (Session.get('contract')) {
      if (Session.get('contract').ballotEnabled === false) {
        return 'paper-empty';
      }
    }
    return '';
  },
  ballotEnabled() {
    if (Session.get('contract')) {
      return Session.get('contract').ballotEnabled;
    }
    return false;
  },
  voter() {
    // TODO: display all voters in this contract
  },
});
