import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './card.html';
import '../avatar/avatar.js';

Template.card.helpers({
  myself() {
    return (this.toString() === Meteor.userId() || this._id === '0000000');
  },
  voteSettings() {
    return {
      voteId: `vote-${Meteor.userId()}-${this.toString()}`,
      wallet: Meteor.user().profile.wallet,
      sourceId: Meteor.userId(),
      targetId: this.toString(),
    };
  },
});
