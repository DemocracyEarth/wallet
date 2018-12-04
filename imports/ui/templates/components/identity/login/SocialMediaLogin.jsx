import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { TAPi18n } from 'meteor/tap:i18n';

import { displayLogin } from '/imports/ui/modules/popup';
import { displayNotice } from '/imports/ui/modules/notice';
import Warning from '/imports/ui/templates/widgets/warning/Warning.jsx';

export default class SocialMediaLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      termsCheck: false,
      termsWarning: false,
    };

    this.handleFacebookLogin = this.handleFacebookLogin.bind(this);
    this.handleTwitterLogin = this.handleTwitterLogin.bind(this);
    this.handleAgoraLogin = this.handleAgoraLogin.bind(this);
    this.handleBlockstackLogin = this.handleBlockstackLogin.bind(this);
    this.termsCheck = this.termsCheck.bind(this);
  }

  handleFacebookLogin() {
    Meteor.call('updateAPIKeys');
    Meteor.loginWithFacebook({}, function (err) {
      if (err.reason) {
        throw new Meteor.Error('Facebook login failed ', err.reason);
      }
    });
  }

  handleTwitterLogin() {
    Meteor.loginWithTwitter({}, function (err) {
      if (err.reason) {
        throw new Meteor.Error('Twitter login failed ', err.reason);
      }
    });
  }

  handleBlockstackLogin() {
    if (this.state.termsCheck) {
      Meteor.loginWithBlockstack({}, function (err) {
        if (err.reason) {
          throw new Meteor.Error('Blockstack login failed', err.reason);
        }
      });
    } else {
      this.setState({ termsWarning: !(this.state.termsWarning) });
    }
  }

  handleAgoraLogin() {
    displayLogin(event, document.getElementById('loggedUser'));
  }

  termsCheck() {
    this.setState({ termsCheck: !(this.state.termsCheck) });
  }

  render() {
    const uncheckedTerms = this.state.termsWarning;

    if (this.props.agoraMode) {
      return (
        <div>
          <div className="button-wrap-half">
            <button id="agora-login" className="button login-button" onClick={this.handleAgoraLogin} >{TAPi18n.__('log-in')}</button>
          </div>
          <div className="button-wrap-half">
            <button id="facebook-login" className="button login-button facebook" onClick={this.handleFacebookLogin} >{TAPi18n.__('facebook')}</button>
          </div>
        </div>
      );
    }
    return (
      <div>
        <div id="blockstack-login" className="button login-button blockstack" onClick={this.handleBlockstackLogin}>
          <img src="/images/blockstack.png" className="button-icon" alt="lock" />
          {TAPi18n.__('blockstack-id')}
        </div>
        <div className="login-input blockstack-terms">
          <label htmlFor="terms" className="login-label">
            <input id="terms" type="checkbox" className="checkbox-terms" onClick={this.termsCheck} />
            <span dangerouslySetInnerHTML={{ __html: TAPi18n.__('blockstack-terms') }} />
          </label>
        </div>
        {uncheckedTerms ? <div className="extra section"> <Warning label="must-agree-terms" /> </div> : null}
        {/*<div id="facebook-login" className="button login-button facebook" onClick={this.handleFacebookLogin} >
          <img src="/images/facebook.png" className="button-icon" alt="lock" />
          {TAPi18n.__('facebook')}
        </div>*/}
        {/* <div id="twitter-login" className="button button-social twitter" onClick={this.handleTwitterLogin} >{{_ 'twitter'}}</div> */}
      </div>
    );
  }
}

SocialMediaLogin.propTypes = {
  agoraMode: PropTypes.bool.isRequired,
};
