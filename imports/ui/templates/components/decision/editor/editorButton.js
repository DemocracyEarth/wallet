import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { timers } from '/lib/const';

import './editorButton.html';

Template.editorButton.events({
  'click .editor-button'() {
    this.action();
  },
});
