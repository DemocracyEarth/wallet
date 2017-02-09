import { Template } from 'meteor/templating';

import './signup.html';
import Signup from './Signup.jsx';

Template.signup.helpers({
  Signup() {
    return Signup;
  },
});
