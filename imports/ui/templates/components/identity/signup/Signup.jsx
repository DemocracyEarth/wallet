import React, { Component } from 'react';
import { TAPi18n } from 'meteor/tap:i18n';
import { Accounts } from 'meteor/accounts-base';
import Warning from '../../../widgets/warning/Warning.jsx';

export default class Signup extends Component {
  constructor(props) {
    super(props);
    // this.state = {
    // };

    // this.handleSubmit = this.handleSubmit.bind(this);
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
              <img src="/images/id-card.png" className="login-icon" />
              <input id="signup-input" name="username-signup" type="text" placeholder={TAPi18n.__('username-sample')} className="w-input login-input" />
            </div>
            <div className="w-clearfix login-field">
              <label htmlFor="signup-email" className="login-label login-label-form">
                {TAPi18n.__('email')}
              </label>
              <img src="/images/mail-closed.png" className="login-icon" />
              <input id="signup-input" name="email-signup" type="text" placeholder={TAPi18n.__('email-sample')} className="w-input login-input" />
            </div>
            <div className="w-clearfix login-field">
              <label htmlFor="signup-password" className="login-label login-label-form">
                {TAPi18n.__('password')}
              </label>
              <img src="/images/lock.png" className="login-icon" />
              <input id="signup-input" name="password-signup" type="password" placeholder={TAPi18n.__('password-sample')} className="w-input login-input" />
            </div>
            <div className="w-clearfix login-field">
              <label htmlFor="signup-password-doublecheck" className="login-label login-label-form">
                {TAPi18n.__('password-again')}
              </label>
              <img src="/images/lock.png" className="login-icon" />
              <input id="signup-input" name="mismatchPassword" type="password" placeholder={TAPi18n.__('password-sample-again')} className="w-input login-input" />
            </div>
            <div id="signup-button" className="button login-button">
              <div>{TAPi18n.__('sign-up')}</div>
            </div>
          </form>
        </div>
        <div>{TAPi18n.__('already-have-account')} <a id='signup'>{TAPi18n.__('sign-in')}</a>.</div>
      </div>
    );
  }
}
