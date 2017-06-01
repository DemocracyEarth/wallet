import { Template } from 'meteor/templating';

import './editorButton.html';

Template.editorButton.events({
  'click .editor-button'() {
    this.action();
  },
});
