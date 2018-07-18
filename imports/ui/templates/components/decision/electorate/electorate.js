import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { TAPi18n } from 'meteor/tap:i18n';

import { displayPopup } from '/imports/ui/modules/popup';
import { toggle } from '/imports/ui/templates/components/decision/editor/editor.js';

import '/imports/ui/templates/components/decision/electorate/electorate.html';

const _check = (contract) => {

}

const _writeRule = (contract) => {
  if (contract.constituency && contract.constituency.length > 0) {
    for (const i in contract.constituency) {
      break;
    }
  }
  return TAPi18n.__('anyone-vote');
};

Template.electorate.helpers({
  status() {
    return _writeRule(this.contract);
  },
  check() {
    return _check(this.contract);
  },
  icon() {
    if (!this.readOnly) {
      if (Session.get('draftContract').constituencyEnabled) {
        return 'active';
      }
    }
    if (!_check(this.contract)) {
      return 'enabled';
    }
    return 'enabled';
  },
  readOnly() {
    if (this.readOnly) {
      return 'editor-button-readonly';
    }
    return '';
  },
});

Template.electorate.events({
  'click #electorate-button'() {
    if (!this.readOnly) {
      toggle('constituencyEnabled', !Session.get('draftContract').constituencyEnabled);
      displayPopup($('#electorate-button')[0], 'constituency', Meteor.userId(), 'click', 'constituency-popup');
    }
  },
});
