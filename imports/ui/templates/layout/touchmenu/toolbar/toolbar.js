import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';

import { Contracts } from '/imports/api/contracts/Contracts';
import { publishContract } from '/imports/startup/both/modules/Contract';
import { displayNotice } from '/imports/ui/modules/notice';
import { keepKeyboard } from '/imports/ui/templates/components/decision/editor/editor';


import './toolbar.html';

function isDisabled() {
  return (Session.get('missingTitle') || Session.get('mistypedTitle') || Session.get('duplicateURL') || (Session.get('availableChars') < 0));
}

function toggle(key, value) {
  const obj = {};
  obj[key] = value;
  Contracts.update(Session.get('contract')._id, { $set: obj });
}

Template.toolbar.onRendered(() => {
  document.getElementById('mobileToolbar').addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, false);
});

Template.toolbar.helpers({
  disabled() {
    if (isDisabled()) {
      return 'mobile-button-disabled';
    }
    return '';
  },
  ballotToggle() {
    if (Session.get('contract').ballotEnabled) {
      return 'images/toggle-ballot-on.png';
    }
    return 'images/toggle-ballot-off.png';
  },
});

Template.toolbar.events({
  'click #mobile-post-button'() {
    if (!isDisabled()) {
      publishContract(Session.get('contract')._id);
      displayNotice(TAPi18n.__('posted-idea'), true);
      Session.set('displayToolbar', false);
    }
  },
  'click #toolbar-toggle-ballot'(event) {
    event.preventDefault();
    event.stopPropagation();
    if (Session.get('contract').stage === 'DRAFT') {
      keepKeyboard();
      toggle('ballotEnabled', !Session.get('contract').ballotEnabled);
    }
  },
});

Template.counter.helpers({
  characters() {
    return Session.get('availableChars');
  },
  excess() {
    if (Session.get('availableChars') <= 20) {
      return 'counter-excess';
    }
    return '';
  },
});
