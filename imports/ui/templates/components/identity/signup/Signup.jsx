import React, { Component, PropTypes } from 'react';
import { TAPi18n } from 'meteor/tap:i18n';
import Warning from '../../../widgets/warning/Warning.jsx';

export default class Signup extends Component {
  constructor(props) {
    super(props);
    this.handleSignupRender = this.handleSignupRender.bind(this);
  }

  handleSignupRender() {
    this.props.onClick();
  }

  render() {
    return (
      <div className="login">
        <div className="w-form">
          <form id="signup-new-user" name="signup-form">
            <div className="w-clearfix login-field">
              <label htmlFor="signup-username" className="login-label login-label-form">
                {TAPi18n.__('username')}
              </label>
              <img src="/images/id-card.png" className="login-icon" alt="id-card" />
              <input id="signup-input" name="username-signup" type="text" placeholder={TAPi18n.__('username-sample')} className="w-input login-input" />
            </div>
            <div className="w-clearfix login-field">
              <label htmlFor="signup-email" className="login-label login-label-form">
                {TAPi18n.__('email')}
              </label>
              <img src="/images/mail-closed.png" className="login-icon" alt="mail-closed" />
              <input id="signup-input" name="email-signup" type="text" placeholder={TAPi18n.__('email-sample')} className="w-input login-input" />
            </div>
            <div className="w-clearfix login-field">
              <label htmlFor="signup-password" className="login-label login-label-form">
                {TAPi18n.__('password')}
              </label>
              <img src="/images/lock.png" className="login-icon" alt="lock" />
              <input id="signup-input" name="password-signup" type="password" placeholder={TAPi18n.__('password-sample')} className="w-input login-input" />
            </div>
            <div className="w-clearfix login-field">
              <label htmlFor="signup-password-doublecheck" className="login-label login-label-form">
                {TAPi18n.__('password-again')}
              </label>
              <img src="/images/lock.png" className="login-icon" alt="lock" />
              <input id="signup-input" name="mismatchPassword" type="password" placeholder={TAPi18n.__('password-sample-again')} className="w-input login-input" />
            </div>
            <div id="signup-button" className="button login-button">
              <div>{TAPi18n.__('sign-up')}</div>
            </div>
          </form>
        </div>
        <div>{TAPi18n.__('already-have-account')} <a id="signup" onClick={this.handleSignupRender}>{TAPi18n.__('sign-in')}</a>.</div>
      </div>
    );
  }
}

Signup.propTypes = {
  onClick: PropTypes.func.isRequired,
};
