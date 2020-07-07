import { Template } from 'meteor/templating';

import Timeline from '/imports/ui/templates/widgets/timeline/timeline.jsx';

import '/imports/ui/templates/widgets/timeline/timeline.html';

Template.timeline.helpers({
  Timeline() {
    return Timeline;
  },
});
