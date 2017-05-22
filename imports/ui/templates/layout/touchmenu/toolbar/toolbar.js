import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';

import { publishContract } from '/imports/startup/both/modules/Contract';
import { displayModal } from '/imports/ui/modules/modal';


import './toolbar.html';

function isDisabled() {
  return (Session.get('missingTitle') || Session.get('mistypedTitle') || Session.get('duplicateURL') || (Session.get('availableChars') < 0));
}

Template.toolbar.onRendered(() => {
});

Template.toolbar.helpers({
  disabled() {
    if (isDisabled()) {
      return 'mobile-button-disabled';
    }
    return '';
  },
});

Template.toolbar.events({
  'click #mobile-post-button'() {
    if (!isDisabled()) {
      displayModal(
        true,
        {
          icon: 'images/modal-ballot.png',
          title: TAPi18n.__('launch-vote-proposal'),
          message: TAPi18n.__('publish-proposal-warning'),
          cancel: TAPi18n.__('not-now'),
          action: TAPi18n.__('publish-proposal'),
          displayProfile: false,
        },
        () => {
          publishContract(Session.get('contract')._id);
        }
      );
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
