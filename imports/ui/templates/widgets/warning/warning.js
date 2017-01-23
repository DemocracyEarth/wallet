import { Template } from 'meteor/templating';

import './warning.html';
import Warning from './warning.jsx';

Template.warning.helpers({
  Warning() {
    return Warning;
  },
});
