import { Template } from 'meteor/templating';

import Timeline from '/imports/ui/templates/timeline/Timeline.jsx';

import '/imports/ui/templates/timeline/timeline.html';

Template.timeline.helpers({
  Timeline() {
    return Timeline;
  },
});
