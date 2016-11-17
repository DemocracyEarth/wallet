import { Template } from 'meteor/templating';
import { behave } from '/imports/ui/modules/animation';

import './warning.html';

Template.warning.rendered = function rendered() {
  behave(this.firstNode, 'fade-and-roll', { height: '36px' });
};
