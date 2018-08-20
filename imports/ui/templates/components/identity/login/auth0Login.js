import { Template } from 'meteor/templating';

import './auth0Login.html';
import Auth0Login from './Auth0Login.jsx';

Template.auth0Login.helpers({
  Auth0Login() {
    return Auth0Login;
  },
});

