import { Template } from 'meteor/templating';

import '/imports/ui/templates/components/decision/poll/poll.html';

Template.poll.helpers({
  pollItem() {
    return Session.get('draftContract') ? Session.get('draftContract').poll : false;
  },
  item() {
    console.log('pollItem');
    console.log(this);
    return this.list;
  },
});
