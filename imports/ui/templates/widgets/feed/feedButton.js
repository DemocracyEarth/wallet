import { Template } from 'meteor/templating';

import { createContract } from '/imports/startup/both/modules/Contract';
import './feedButton.html';

Template.feedButton.onRendered = function onReder() {
  // feedButtonId.push(this.firstNode.id);
  // Session.set('feedToggle' + feedButtonId, false);
};

Template.feedButton.helpers({
  display: function () {

    //return Session.get('feedToggle' + feedButtonId);
  }
});

Template.feedButton.events({
  'mousedown .feedButton': function (event) {
    var buttonId = 'button-' + event.target.id;
    var buttonHoverId = 'button-hover-' + event.target.id;
    if (document.getElementById(buttonId)) {
      document.getElementById(buttonId).style.opacity = 0;
    }
    if (document.getElementById(buttonHoverId)) {
      document.getElementById(buttonHoverId).style.opacity = 1;
    }
  },
  'mouseup .feedButton, mousemove .feedButton': function (event) {
    var buttonId = 'button-' + event.target.id;
    var buttonHoverId = 'button-hover-' + event.target.id;
    if (event.type == 'mouseup') {
      if (document.getElementById(buttonId)) {
        document.getElementById(buttonId).style.opacity = 1;
      }
      if (document.getElementById(buttonHoverId)) {
        document.getElementById(buttonHoverId).style.opacity = 0;
      }
    }
  },
  'click .feedButton': function (event) {
    createContract();
  }
});
