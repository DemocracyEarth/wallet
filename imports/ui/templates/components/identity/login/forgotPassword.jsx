import React, { Component, PropTypes } from 'react';
import { TAPi18n } from 'meteor/tap:i18n';

export default class ForgotPassword extends Component {
  render() {
    return (
      <div className="w-form">
        <div className="w-clearfix login-field">

          <label for="name" className="login-label login-label-form">{TAPi18n.__('recovery-email')}</label>
          <img src="{{pathFor route='home'}}images/mail-closed.png" className="login-icon">
          <input id="recovery-email" type="text" placeholder={TAPi18n.__('email-sample')} className="w-input login-input">
        
        </div>
        <div id="recovery-button" className="button login-button">

          <div>{TAPi18n.__('continue-password-recovery')}</div>
        
        </div>
      </div>
    );
  }
}
