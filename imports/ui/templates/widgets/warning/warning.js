import { Template } from 'meteor/templating';

import './warning.html';
import Warning from './Warning.jsx';

Template.warning.helpers({
  Warning() {
    return Warning;
  },
});
