import React, { Component, PropTypes } from 'react';
import { TAPi18n } from 'meteor/tap:i18n';
import { Accounts } from 'meteor/accounts-base';
import { Session } from 'meteor/session';

import { getImageTemplate } from '/imports/ui/templates/layout/templater';
import Warning from '../../../widgets/warning/Warning.jsx';

export default class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      warningState: '',
      images: {},
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleForgotPasswordRender = this.handleForgotPasswordRender.bind(this);
  }


  async componentWillMount() {
    await getImageTemplate().then((resolved) => { this.setState({ images: resolved }); });
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

  handleForgotPasswordRender() {
    this.props.onClick();
  }

  render() {
    const warningState = this.state.warningState;
    let warning = null;

    if (warningState !== '') {
      warning = <Warning label={warningState} />;
    }

    return (
      <div>
        <div className="w-clearfix paper-header card-header">
          <div className="card-title">
            <div id="card-back">
              <img src={this.state.images.back} className="section-icon section-icon-active" onClick={this.handleForgotPasswordRender} alt="lock" />
            </div>
            {TAPi18n.__('identity')}
          </div>
        </div>
        <div className="login">
          <form id="recover-password" name="forgot-password-form" onSubmit={this.handleSubmit}>
            <div className="w-clearfix login-field">
              <label htmlFor="name" className="login-label login-label-form">{TAPi18n.__('recovery-email')}</label>
              <img src={this.state.images['mail-closed']} className="login-icon" alt="mail-closed" />
              <input id="recovery-email" type="text" placeholder={TAPi18n.__('email-sample')} className="w-input login-input" />
              {warning}
            </div>
            <div className="w-clearfix login-field">
              {TAPi18n.__('email-recovery-instructions')}
            </div>
            <div type="submit" id="recovery-button" className="button login-button" onClick={this.handleSubmit}>
              <div>{TAPi18n.__('continue-password-recovery')}</div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

ForgotPassword.propTypes = {
  onClick: PropTypes.func.isRequired,
};
