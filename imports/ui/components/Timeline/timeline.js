import { Template } from 'meteor/templating';

import Timeline from '/imports/ui/components/Timeline/Timeline.jsx';

import '/imports/ui/components/Timeline/timeline.html';

Template.timeline.helpers({
  Timeline() {
    return Timeline;
  },
});
