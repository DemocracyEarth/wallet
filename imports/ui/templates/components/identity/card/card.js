import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { startDelegation } from '/imports/startup/both/modules/Contract';
import { convertToSlug } from '/lib/utils';

let newDelegateName = '';

Template.card.helpers({
  myself: function () {
    return (this.toString() == Meteor.userId() || this._id == '0000000');
  },
  delegationKeyword: function () {
    var user = Meteor.users.findOne({ _id: this.toString() });
    Session.set('newDelegate', user);
    if (user != undefined) {
      newDelegateName = convertToSlug(user.username);
      return user;
    }
  }
})

Template.card.events({
  'click #delegate'() {
    var keywordTitle = convertToSlug(Meteor.user().username) + '-' + convertToSlug(Session.get('newDelegate').username);
    if (keywordTitle != undefined) {
      startDelegation(Meteor.userId(), this.toString(), {
        title: keywordTitle,
        signatures: [
          {
            username: Meteor.user().username
          },
          {
            username: Session.get('newDelegate').username
          }
        ]
      });
      Modules.client.animatePopup(false);
    }
  }
})
