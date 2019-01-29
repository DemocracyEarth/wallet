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
      images: {},
    };

    this.handleLoginRender = this.handleLoginRender.bind(this);
    this.handleForgotPasswordRender = this.handleForgotPasswordRender.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSigninError = this.handleSigninError.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
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

  handleFocus() {
    this.setState({ incorrectUser: false });
  }

  handleSigninError() {
    this.setState({ incorrectUser: true });
  }

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
    const loginScreen = this.state.loginScreen;

    if (this.state.loginScreen === true) {
      if (this.state.passwordKnown === true) {
        return (
          <div>
            <div className="w-clearfix paper-header card-header">
              <div className="card-title">
                {loginScreen ?
                  <img src={this.state.images.fingerprint} className="section-icon" alt="lock" />
                  :
                  <div id="card-back">
                    <img src={this.state.images.back} className="section-icon section-icon-active" alt="lock" />
                  </div>
                }
                {TAPi18n.__('authenticate-self')}
              </div>
            </div>
            <div className="login margin-bottom-dead">
              <SocialMediaLogin agoraMode={false} />
              {/* <div className="w-form">
                <div className="alert-header alert-header-subtitle"></div>
                <form id="email-signin-form" name="email-form-3" data-name="Email Form 3" onSubmit={this.handleSubmit}>
                  <div className="w-clearfix login-field">
                    <label htmlFor="name" className="login-label login-label-form">{TAPi18n.__('email-username')}</label>
                    <img src="/images/mail-closed.png" className="login-icon" alt="mail-closed" />
                    <input id="signin-email" type="text" placeholder={TAPi18n.__('email-sample')} className="w-input login-input" onFocus={this.handleFocus} />
                  </div>
                  <div className="w-clearfix login-field">
                    <label htmlFor="name" className="login-label login-label-form">{TAPi18n.__('password')}</label>
                    <img src="/images/lock.png" className="login-icon" alt="lock" />
                    <input id="signin-password" type="password" placeholder={TAPi18n.__('password-sample')} className="w-input login-input" onFocus={this.handleFocus} />
                  </div>
                  {incorrectUserState ? <div className="extra section"> <Warning label="user-not-found" /> </div> : null}
                  <div className="popup-text">
                    <a id="signup" onClick={this.handleLoginRender}>{TAPi18n.__('sign-up')}</a> {TAPi18n.__('or')} <a id="forgot-pw" onClick={this.handleForgotPasswordRender}>{TAPi18n.__('recover-password')}</a>.
                  </div>
                  <div type="submit" id="signin-button" className="button login-button" onClick={this.handleSubmit}>
                    <div>{TAPi18n.__('sign-in')}</div>
                  </div>
                  <div id="facebook-login" className="button login-button facebook" onClick={this.handleFacebookLogin} >
                    <img src="/images/facebook.png" className="button-icon" alt="lock" />
                    {TAPi18n.__('facebook')}
                  </div>
                </form>
              </div> */}
            </div>
          </div>
        );
      } else if (this.state.passwordKnown === false) {
        return (<ForgotPassword onClick={this.handleForgotPasswordRender} />);
      }
    } else if (this.state.loginScreen === false) {
      return (<Signup onClick={this.handleLoginRender} />);
    }
  }
}
