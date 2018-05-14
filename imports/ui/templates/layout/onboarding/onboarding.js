import { Template } from 'meteor/templating';

import './onboarding.html';
import App from './App.jsx';

Template.onboarding.helpers({
  Onboarding() {
    return App;
  },
});
