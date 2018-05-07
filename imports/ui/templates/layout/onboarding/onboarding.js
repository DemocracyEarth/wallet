import { Template } from 'meteor/templating';

import './onboarding.html';
import Onboarding from './Onboarding.jsx';

Template.onboarding.helpers({
  Onboarding() {
    return Onboarding;
  },
});
