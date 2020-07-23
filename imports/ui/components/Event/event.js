import { Template } from 'meteor/templating';

import Event from '/imports/ui/components/Event/Event.jsx';

import '/imports/ui/components/Event/event.html';

Template.event.helpers({
  Event() {
    return Event;
  },
});

