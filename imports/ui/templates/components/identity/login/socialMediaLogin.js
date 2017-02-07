import { Template } from 'meteor/templating';

import './socialMediaLogin.html';
import SocialMediaLogin from './SocialMediaLogin.jsx';

Template.socialMediaLogin.helpers({
  SocialMediaLogin() {
    return SocialMediaLogin;
  },
});
