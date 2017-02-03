import { Template } from 'meteor/templating';
import './forgotPassword.html';
import ForgotPassword from './ForgotPassword.jsx';

Template.forgotPassword.helpers({
  ForgotPassword() {
    return ForgotPassword;
  },
});
