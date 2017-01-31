import React, { Component } from 'react';
import { TAPi18n } from 'meteor/tap:i18n';
import { Accounts } from 'meteor/accounts-base';
import Warning from '../../../widgets/warning/Warning.jsx';

export default class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      warningState: '',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();

    // Get recovery email
    const email = document.getElementById('recovery-email').value;

    // Reset warningState in case #recovery-button is clicked multiple times
    this.setState({ warningState: '' });

    // Validate non-empty email & invoke Passwords API
    if (email !== '') {
      Accounts.forgotPassword({ email: email }, function (err) {
        if (err) {
          if (err.message === 'User not found [403]') {
            this.setState({ warningState: 'user-not-found' });
          } else {
            this.setState({ warningState: 'something-wrong' });
          }
        } else {
          this.setState({ warningState: 'email-sent' });
        }
      }.bind(this));
    }
  }

  render() {
    const warningState = this.state.warningState;
    let warning = null;

    if (warningState !== '') {
      warning = <Warning label={warningState} />;
    }

    return (
      <div>
        <form className="w-form" onSubmit={this.handleSubmit}>
          <div className="w-clearfix login-field">
            <label htmlFor="name" className="login-label login-label-form">{TAPi18n.__('recovery-email')}</label>
            <img src="/images/mail-closed.png" className="login-icon" alt="mail-closed" />
            <input id="recovery-email" type="text" placeholder={TAPi18n.__('email-sample')} className="w-input login-input" />
          </div>
          <button type="submit" id="recovery-button" className="button login-button" onClick={this.handleSubmit}>
            <div>{TAPi18n.__('continue-password-recovery')}</div>
          </button>
        </form>
        {warning}
      </div>
    );
  }
}
