import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { startDelegation } from '/imports/startup/both/modules/Contract';
import { convertToSlug } from '/lib/utils';
import { animatePopup } from '/imports/ui/modules/popup';

import './card.html';
import '../avatar/avatar.js';

Template.card.helpers({
  myself() {
    return (this.toString() === Meteor.userId() || this._id === '0000000');
  },
  delegationKeyword() {
    const user = Meteor.users.findOne({ _id: this.toString() });
    Session.set('newDelegate', user);
    return user;
  },
});

Template.card.events({
  'click #delegate'() {
    const keywordTitle = `${convertToSlug(Meteor.user().username)}-${convertToSlug(Session.get('newDelegate').username)}`;
    if (keywordTitle !== undefined) {
      startDelegation(Meteor.userId(), this.toString(), {
        title: keywordTitle,
        signatures: [
          {
            username: Meteor.user().username,
          },
          {
            username: Session.get('newDelegate').username,
          },
        ],
      });
      animatePopup(false);
    }
  },
});
