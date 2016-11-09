import { Template } from 'meteor/templating';
import { behave } from '/imports/ui/modules/animation';

import './execute.html';
import '../fork/fork.js';

Template.execute.onRendered = function onRender() {
  behave(this.firstNode, 'fade');
};
