import React, { Component, PropTypes } from 'react';
import { TAPi18n } from 'meteor/tap:i18n';

import { validateEmail } from '/imports/startup/both/modules/validations.js';
import { validatePassword, validatePasswordMatch, createUser, validateUsername } from '/imports/startup/both/modules/User.js';

import Warning from '../../../widgets/warning/Warning.jsx';

export default class Signup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      invalidUsername: false,
      repeatedUsername: false,
      invalidEmail: false,
      invalidPassword: false,
      mismatchPassword: false,
      alreadyRegistered: false,
    };

    this.handleSignupRender = this.handleSignupRender.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSignupError = this.handleSignupError.bind(this);
  }

  handleSignupRender() {
    this.props.onClick();
  }

  handleFocus() {
    this.setState({ alreadyRegistered: false });
  }

  handleSignupError() {
    this.setState({ alreadyRegistered: true });
  }

  handleBlur(event) {
    if (event.target.value !== '') {
      switch (event.target.name) {
        case 'username-signup':
          const validUsername = validateUsername(event.target.value);
          this.setState({ invalidUsername: validUsername.valid });
          this.setState({ repeatedUsername: validUsername.repeated });
          break;
        case 'email-signup':
          const validEmail = validateEmail(event.target.value);
          this.setState({ invalidEmail: !validEmail });
          break;
        case 'password-signup':
          const validPassword = validatePassword(event.target.value);
          this.setState({ invalidPassword: !validPassword });
          if (document.getElementsByName('mismatchPassword')[0].value !== '') {
            const validPwMatch = validatePasswordMatch(document.getElementsByName('mismatchPassword')[0].value, event.target.value);
            this.setState({ mismatchPassword: !validPwMatch });
          }
          break;
        case 'mismatchPassword':
          const validPwMatch = validatePasswordMatch(document.getElementsByName('password-signup')[0].value, event.target.value);
          this.setState({ mismatchPassword: !validPwMatch });
          break;
      }
    }
  }

  handleSubmit(event) {
    const userData = {
      username: document.getElementsByName('username-signup')[0].value,
      email: document.getElementsByName('email-signup')[0].value,
      password: document.getElementsByName('password-signup')[0].value,
      mismatchPassword: document.getElementsByName('mismatchPassword')[0].value,
    };

    (async function (handleSignupError) {
      try {
        await createUser(userData);
      } catch (e) {
        handleSignupError();
      }
    }(this.handleSignupError));
  }

  render() {
    const invalidUsernameState = this.state.invalidUsername;
    const repeatedUsernameState = this.state.repeatedUsername;
    const invalidEmailState = this.state.invalidEmail;
    const invalidPasswordState = this.state.invalidPassword;
    const mismatchPasswordState = this.state.mismatchPassword;
    const alreadyRegisteredState = this.state.alreadyRegistered;

    return (
      <div>
        <div className="w-clearfix paper-header card-header">
          <div className="stage stage-finish-approved stage-card stage-anon button">
            <div className="label label-corner">
              {TAPi18n.__('anonymous-mode')}
            </div>
          </div>
          <div className="card-title">
            <div id="card-back">
              <img src="images/back.png" className="section-icon section-icon-active" onClick={this.handleSignupRender} alt="lock" />
            </div>
            {TAPi18n.__('identity')}
          </div>
        </div>
        <div className="login">
          <form id="signup-new-user" name="signup-form">
            <div className="w-clearfix login-field">
              <label htmlFor="signup-username" className="login-label login-label-form">
                {TAPi18n.__('username')}
              </label>
              <img src="/images/id-card.png" className="login-icon" alt="id-card" />
              <input id="signup-input" name="username-signup" type="text" placeholder={TAPi18n.__('username-sample')} className="w-input login-input" onFocus={this.handleFocus} onBlur={this.handleBlur} />
              {invalidUsernameState ? <Warning label="invalid-username" /> : null}
              {repeatedUsernameState ? <Warning label="repeated-username" /> : null}
            </div>
            <div className="w-clearfix login-field">
              <label htmlFor="signup-email" className="login-label login-label-form">
                {TAPi18n.__('email')}
              </label>
              <img src="/images/mail-closed.png" className="login-icon" alt="mail-closed" />
              <input id="signup-input" name="email-signup" type="text" placeholder={TAPi18n.__('email-sample')} className="w-input login-input" onFocus={this.handleFocus} onBlur={this.handleBlur} />
              {invalidEmailState ? <Warning label="invalid-email" /> : null}
            </div>
            <div className="w-clearfix login-field">
              <label htmlFor="signup-password" className="login-label login-label-form">
                {TAPi18n.__('password')}
              </label>
              <img src="/images/lock.png" className="login-icon" alt="lock" />
              <input id="signup-input" name="password-signup" type="password" placeholder={TAPi18n.__('password-sample')} className="w-input login-input" onFocus={this.handleFocus} onBlur={this.handleBlur} />
              {invalidPasswordState ? <Warning label="invalid-password" /> : null}
            </div>
            <div className="w-clearfix login-field">
              <label htmlFor="signup-password-doublecheck" className="login-label login-label-form">
                {TAPi18n.__('password-again')}
              </label>
              <img src="/images/lock.png" className="login-icon" alt="lock" />
              <input id="signup-input" name="mismatchPassword" type="password" placeholder={TAPi18n.__('password-sample-again')} className="w-input login-input" onFocus={this.handleFocus} onBlur={this.handleBlur} />
              {mismatchPasswordState ? <Warning label="mismatch-password" /> : null}
            </div>
            {alreadyRegisteredState ? <div className="extra section"> <Warning label="user-exists" /> </div> : null}
            <div id="signup-button" className="button login-button" onClick={this.handleSubmit} >
              <div>{TAPi18n.__('sign-up')}</div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

Signup.propTypes = {
  onClick: PropTypes.func.isRequired,
};
