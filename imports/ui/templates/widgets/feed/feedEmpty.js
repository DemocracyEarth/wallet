import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './feedEmpty.html';
import './feedButton.js';

Template.feedEmpty.helpers({
  proposalDrafting() {
    if (Meteor.settings.public.app.config.proposalDrafting === false) {
      return false;
    }
    return true;
  },
});
