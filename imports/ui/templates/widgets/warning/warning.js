import { Template } from 'meteor/templating';
import { behave } from '/imports/ui/modules/animation';

import './warning.html';

Template.warning.onRendered = function onRender() {
  behave(this.firstNode, 'fade-and-roll', { height: '36px' });
};
