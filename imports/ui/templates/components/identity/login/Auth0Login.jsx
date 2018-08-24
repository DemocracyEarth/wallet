import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { TAPi18n } from 'meteor/tap:i18n';

import { displayLogin } from '/imports/ui/modules/popup';

export default class Auth0Login extends Component {
  constructor(props) {
    super(props);
    this.handleAuth0Login = this.handleAuth0Login.bind(this);
  }

  handleAuth0Login() {
    Meteor.loginWithAuth0({}, function (err) {
      if (err.reason) {
        throw new Meteor.Error('Auth0 login failed ', err.reason);
      }
    });
  }

  render() {
		return (
			<div>
				<div className="w-clearfix paper-header card-header">
					<div className="stage stage-finish-approved stage-card stage-anon button">
						<div className="label label-corner">
							{TAPi18n.__('anonymous-mode')}
						</div>
					</div>
					<div className="card-title">
						<img src="/images/fingerprint-white.png" className="section-icon" alt="lock" />
						{TAPi18n.__('identity')}
					</div>
				</div>
				<div className="login">
					<button id="auth0-login" className="button login-button auth0" onClick={this.handleAuth0Login} >{TAPi18n.__('auth0')}</button>
				</div>
			</div>
		);
  }
}
