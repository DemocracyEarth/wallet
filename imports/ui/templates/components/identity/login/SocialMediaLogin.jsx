import { Meteor } from 'meteor/meteor';
import React, { Component, PropTypes } from 'react';
import { TAPi18n } from 'meteor/tap:i18n';

import { displayLogin } from '/imports/ui/modules/popup';

export default class SocialMediaLogin extends Component {
  constructor(props) {
    super(props);
    this.handleFacebookLogin = this.handleFacebookLogin.bind(this);
    this.handleTwitterLogin = this.handleTwitterLogin.bind(this);
    this.handleAgoraLogin = this.handleAgoraLogin.bind(this);
    this.handleBlockstackLogin = this.handleBlockstackLogin.bind(this);
    this.handleMetamaskLogin = this.handleMetamaskLogin.bind(this);
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
    Meteor.loginWithBlockstack({}, function (err) {
      if (err.reason) {
        throw new Meteor.Error('Blockstack login failed', err.reason);
      }
    });
  }

  handleMetamaskLogin() {
    Meteor.loginWithMetamask({}, function (err) {
      if (err.reason) {
        throw new Meteor.Error('Metamask login failed', err.reason);
      }
    });
  }

  handleAgoraLogin() {
    displayLogin(event, document.getElementById('loggedUser'));
  }

  render() {
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
        <div id="metamask-login" className="button login-button" onClick={this.handleMetamaskLogin}>
          <img src="/images/metamask.png" className="button-icon" alt="lock" />
          {TAPi18n.__('ethereum')}
        </div>
        <div id="blockstack-login" className="button login-button" onClick={this.handleBlockstackLogin}>
          <img src="/images/blockstack.png" className="button-icon" alt="lock" />
          {TAPi18n.__('blockstack')}
        </div>
        <div className="popup-text">
          <a id="signup" href="https://medium.com/@mail.bahurudeen/setup-a-metamask-ethereum-wallet-and-use-it-to-send-and-receive-ether-4f3b99360e4f" target="_blank">{TAPi18n.__('get-blockchain-id')}</a>.
        </div>
        {/* <div id="twitter-login" className="button button-social twitter" onClick={this.handleTwitterLogin} >{{_ 'twitter'}}</div> */}
      </div>
    );
  }
}

SocialMediaLogin.propTypes = {
  agoraMode: PropTypes.bool.isRequired,
};
