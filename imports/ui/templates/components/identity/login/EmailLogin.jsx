import React, { Component } from 'react';
import { TAPi18n } from 'meteor/tap:i18n';
import Warning from '../../../widgets/warning/Warning.jsx';
import Signup from '../signup/Signup.jsx';

export default class EmailLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginState: 'loginScreen',
    };

    this.renderSignup = this.renderSignup.bind(this);
  }

  renderSignup() {
    this.setState({ loginState: 'signup' });
  }

  render() {
    if (this.state.loginState === 'loginScreen') {
      return (
        <div className="login">
          <div className="w-form">
            <form id="email-signin-form" name="email-form-3" data-name="Email Form 3">
              <div className="w-clearfix login-field">
                <label htmlFor="name" className="login-label login-label-form">{TAPi18n.__('email-username')}</label>
                <img src="/images/mail-closed.png" className="login-icon" alt="mail-closed" />
                <input id="signin-email" type="text" placeholder={TAPi18n.__('email-sample')} className="w-input login-input" />
              </div>
              <div className="w-clearfix login-field">
                <label htmlFor="name" className="login-label login-label-form">{TAPi18n.__('password')}</label>
                <img src="/images/lock.png" className="login-icon" alt="lock" />
                <input id="signin-password" type="password" placeholder={TAPi18n.__('password-sample')} className="w-input login-input" />
              </div>
              <button type="submit" id="signin-button" className="button login-button">
                <div>{TAPi18n.__('sign-in')}</div>
              </button>
            </form>
          </div>
          <div>
            <a id="forgot-pw">{TAPi18n.__('forgot-password')}</a>
          </div>
          <div>
            {TAPi18n.__('dont-have-account')} <a id="signup" onClick={this.renderSignup}>{TAPi18n.__('sign-up')}</a>.
          </div>
        </div>
      );
    } else if (this.state.loginState === 'signup') {
      return (
        <Signup />
      );
    }
  }
}
