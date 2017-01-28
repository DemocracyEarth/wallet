import React, { Component, PropTypes } from 'react';
import { TAPi18n } from 'meteor/tap:i18n';

export default class ForgotPassword extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log("handleSubmit()");
  }

  render() {
    return (
      <form className="w-form" onSubmit={this.handleSubmit}>
        <div className="w-clearfix login-field">
          <label htmlFor="name" className="login-label login-label-form">{TAPi18n.__('recovery-email')}</label>
          <img src="/images/mail-closed.png" className="login-icon" />
          <input id="recovery-email" type="text" placeholder={TAPi18n.__('email-sample')} className="w-input login-input" />
        </div>
        <button type="submit" id="recovery-button" className="button login-button" onClick={this.handleSubmit.bind(this)}>
          <div>{TAPi18n.__('continue-password-recovery')}</div>
        </button>
      </form>
    );
  }
}
