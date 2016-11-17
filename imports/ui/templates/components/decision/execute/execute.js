import { Template } from 'meteor/templating';
import { behave } from '/imports/ui/modules/animation';

import './execute.html';
import '../fork/fork.js';

Template.execute.rendered = function rendered() {
  behave(this.firstNode, 'fade');
};
