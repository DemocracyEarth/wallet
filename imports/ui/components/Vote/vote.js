import { Template } from 'meteor/templating';

import Vote from '/imports/ui/components/Vote/Vote.jsx';

import '/imports/ui/components/Vote/vote.html';

Template.vote.helpers({
  Vote() {
    return Vote;
  },
});

