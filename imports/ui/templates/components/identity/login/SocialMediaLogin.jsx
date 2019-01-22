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
    this.getHTML = this.getHTML.bind(this);
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

  getHTML(dictionary)  {
    return { __html: TAPi18n.__(dictionary) };
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
    if (Meteor.Device.isPhone()) {
      return (
        <div>
          <div className="walleticon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="59" viewBox="0 0 64 59"><path fill-rule="nonzero" d="M64 27.125h-5V10H7.5A2.503 2.503 0 0 1 5 7.5C5 6.121 6.121 5 7.5 5H54V0H7.5C3.365 0 0 3.364 0 7.5v44C0 55.635 3.365 59 7.5 59H59V42.125h5v-15zM54 54H7.5A2.503 2.503 0 0 1 5 51.5V14.57c.782.277 1.624.43 2.5.43H54v12.125h-5.75c-4.135 0-7.5 3.365-7.5 7.5s3.365 7.5 7.5 7.5H54V54zm5-16.875H48.25a2.503 2.503 0 0 1-2.5-2.5c0-1.379 1.121-2.5 2.5-2.5H59v5z"></path></svg>
          </div>
          <div className="card-login-label">
            <div dangerouslySetInnerHTML= {this.getHTML('get-dapp-browser')} />
          </div>
          <div id="metamask-login" className="button login-button login-button-first login-button-last" onClick={this.handleMetamaskLogin}>
            {TAPi18n.__('ethereum-dapp-browsers')}
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className="walleticon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="59" viewBox="0 0 64 59"><path fill-rule="nonzero" d="M64 27.125h-5V10H7.5A2.503 2.503 0 0 1 5 7.5C5 6.121 6.121 5 7.5 5H54V0H7.5C3.365 0 0 3.364 0 7.5v44C0 55.635 3.365 59 7.5 59H59V42.125h5v-15zM54 54H7.5A2.503 2.503 0 0 1 5 51.5V14.57c.782.277 1.624.43 2.5.43H54v12.125h-5.75c-4.135 0-7.5 3.365-7.5 7.5s3.365 7.5 7.5 7.5H54V54zm5-16.875H48.25a2.503 2.503 0 0 1-2.5-2.5c0-1.379 1.121-2.5 2.5-2.5H59v5z"></path></svg>
        </div>
        <div className="card-login-label">
          <div dangerouslySetInnerHTML= {this.getHTML('get-web3-wallet')} />
        </div>
        <div id="metamask-login" className="button login-button login-button-first login-button-last" onClick={this.handleMetamaskLogin}>
          {TAPi18n.__('ethereum-web3-wallet')}
        </div>
        {/* <div id="twitter-login" className="button button-social twitter" onClick={this.handleTwitterLogin} >{{_ 'twitter'}}</div> */}
      </div>
    );
  }
}

SocialMediaLogin.propTypes = {
  agoraMode: PropTypes.bool.isRequired,
};
