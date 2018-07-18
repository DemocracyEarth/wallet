import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { animatePopup } from '/imports/ui/modules/popup';
import '/imports/ui/templates/components/decision/constituency/constituency.html';

Template.constituency.events({
  'click #cancel-constituency'() {
    animatePopup();
  },
  'click #execute-constituency'() {

  },
});
