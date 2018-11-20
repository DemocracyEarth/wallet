import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';

import { clearPopups } from '/imports/ui/modules/popup';
import Warning from '../../../widgets/warning/Warning.jsx';
import Signup from '../signup/Signup.jsx';
import ForgotPassword from './ForgotPassword.jsx';
import SocialMediaLogin from './SocialMediaLogin.jsx';

export default class EmailLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginScreen: true,
      passwordKnown: true,
      incorrectUser: false,
    };

    this.handleLoginRender = this.handleLoginRender.bind(this);
    this.handleForgotPasswordRender = this.handleForgotPasswordRender.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSigninError = this.handleSigninError.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
  }

  handleLoginRender() {
    this.setState({ loginScreen: !(this.state.loginScreen) });
  }

  handleForgotPasswordRender() {
    // Session.set('cardNavigation', (this.state.passwordKnown));
    this.setState({ passwordKnown: !(this.state.passwordKnown) });
  }

  handleFocus() {
    this.setState({ incorrectUser: false });
  }

  handleSigninError() {
    this.setState({ incorrectUser: true });
  }

  handleSubmit(event) {
    event.preventDefault();

    const email = document.getElementById('signin-email').value;
    const pass = document.getElementById('signin-password').value;

    Meteor.loginWithPassword(email, pass, (error) => {
      if (error) {
        switch (error.error) {
          case 400:
            // Blank email and/or password
            this.handleSigninError();
            break;
          case 403:
            // User not found or incorrect password
            this.handleSigninError();
            break;
        }
      } else {
        // Successful login
        clearPopups();
      }
    });
  }

  render() {
    return (<SocialMediaLogin agoraMode={false} />);
  }
}
