import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { TAPi18n } from 'meteor/tap:i18n';

import { getImageTemplate } from '/imports/ui/templates/layout/templater';
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
      emailSignup: false,
      images: {},
    };

    this.handleLoginRender = this.handleLoginRender.bind(this);
    this.handleForgotPasswordRender = this.handleForgotPasswordRender.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSigninError = this.handleSigninError.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleEmailSignup = this.handleEmailSignup.bind(this);
  }

  async componentWillMount() {
    await getImageTemplate().then((resolved) => { this.setState({ images: resolved }); });
  }

  handleLoginRender() {
    this.setState({ loginScreen: !(this.state.loginScreen) });
  }

  handleForgotPasswordRender() {
    this.setState({ passwordKnown: !(this.state.passwordKnown) });
  }

  handleEmailSignup() {
    this.setState({ emailSignup: !(this.state.emailSignup) });
  }

  handleFocus() {
    this.setState({ incorrectUser: false });
  }

  handleSigninError() {
    this.setState({ incorrectUser: true });
  }

  // eslint-disable-next-line class-methods-use-this
  handleFacebookLogin() {
    Meteor.call('updateAPIKeys');
    Meteor.loginWithFacebook({}, function (err) {
      if (err.reason) {
        throw new Meteor.Error('Facebook login failed ', err.reason);
      }
    });
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
          default:
        }
      } else {
        // Successful login
        clearPopups();
      }
    });
  }

  render() {
    const incorrectUserState = this.state.incorrectUser;
    if (this.state.loginScreen === true) {
      return (
        <div>
          <div className="w-clearfix paper-header card-header">
            <div className="card-title">
              <img src={this.state.images.fingerprint} className="section-icon" alt="lock" />
              {TAPi18n.__('authenticate-self')}
            </div>
          </div>
          <div className="login margin-bottom-dead">
            <SocialMediaLogin agoraMode={false} />
            <div id="email-login" className="button login-button login-button-last" onClick={this.handleLoginRender}>
              <img src={this.state.images['mail-closed-login-button']} className="button-icon" alt="lock" />
              {TAPi18n.__('email-username')}
            </div>
          </div>
        </div>
      );
    } else if (this.state.loginScreen === false) {
      if (this.state.emailSignup === false && this.state.passwordKnown === true) {
        return (
          <div>
            <div className="w-clearfix paper-header card-header">
              <div className="card-title">
                <div id="card-back" onClick={this.handleLoginRender}>
                  <img src={this.state.images.back} className="section-icon section-icon-active" alt="lock" />
                </div>
                {TAPi18n.__('identity')}
              </div>
            </div>
            <div className="login">
              {/* <div className="alert-header alert-header-subtitle" /> */}
              <form id="email-signin-form" name="email-form-3" data-name="Email Form 3" onSubmit={this.handleSubmit}>
                <div className="w-clearfix login-field">
                  <label htmlFor="name" className="login-label login-label-form">{TAPi18n.__('email-username')}</label>
                  <img src={this.state.images['mail-closed']} className="login-icon" alt="mail-closed" />
                  <input id="signin-email" type="text" placeholder={TAPi18n.__('email-sample')} className="w-input login-input" onFocus={this.handleFocus} />
                </div>
                <div className="w-clearfix login-field">
                  <label htmlFor="name" className="login-label login-label-form">{TAPi18n.__('password')}</label>
                  <img src={this.state.images.lock} className="login-icon" alt="lock" />
                  <input id="signin-password" type="password" placeholder={TAPi18n.__('password-sample')} className="w-input login-input" onFocus={this.handleFocus} />
                </div>
                {incorrectUserState ? <div className="extra section"> <Warning label="user-not-found" /> </div> : null}
                <div className="popup-text">
                  <a id="signup" onClick={this.handleEmailSignup}>{TAPi18n.__('sign-up')}</a> {TAPi18n.__('or')} <a id="forgot-pw" onClick={this.handleForgotPasswordRender}>{TAPi18n.__('recover-password')}</a>.
                </div>
                <div type="submit" id="signin-button" className="button login-button" onClick={this.handleSubmit}>
                  <div>{TAPi18n.__('sign-in')}</div>
                </div>
              </form>
            </div>
          </div>
        );
      }
      if (this.state.emailSignup === false && this.state.passwordKnown === false) {
        return (<ForgotPassword onClick={this.handleForgotPasswordRender} />);
      }
      if (this.state.emailSignup === true && this.state.passwordKnown === true) {
        return (<Signup onClick={this.handleEmailSignup} />);
      }
    }
  }
}
