import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
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
    const blockstackLoginActive = Meteor.settings.public.app.config.loginOptions.blockstack;
    const metamaskLoginActive = Meteor.settings.public.app.config.loginOptions.metamask;

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
          {metamaskLoginActive ?
            <div className="">
              <video width="100%" height="auto" controls controlsList="nodownload" webkitallowfullscreen mozallowfullscreen allowFullScreen poster="https://s3-us-west-2.amazonaws.com/democracyearth/landing/metamask-splash.png">
                <source src="https://s3-us-west-2.amazonaws.com/democracyearth/landing/MetaMask.mp4" type="video/mp4" />
              </video>
            </div>
            :
            null
          }
          {metamaskLoginActive ?
            <div className="extra">
              <a id="signup" href="https://www.toshi.org/" rel="noopener noreferrer" target="_blank">{TAPi18n.__('get-dapp-browser')}</a>.
            </div>
            :
            null
          }
          {metamaskLoginActive ?
            <div id="metamask-login" className="button login-button login-button-only" onClick={this.handleMetamaskLogin}>
              <img src="/images/ethereum.png" className="button-icon" alt="lock" />
              {TAPi18n.__('ethereum-dapp-browsers')}
            </div>
            :
            null
          }
          {blockstackLoginActive ?
            <div id="blockstack-login" className="button login-button" onClick={this.handleBlockstackLogin}>
              <img src="/images/blockstack.png" className="button-icon" alt="lock" />
              {TAPi18n.__('blockstack-id')}
            </div>
            :
            null
          }
        </div>
      );
    }
    return (
      <div>
        {metamaskLoginActive ?
          <div className="">
            <video width="100%" height="auto" controls controlsList="nodownload" webkitallowfullscreen mozallowfullscreen allowFullScreen poster="https://s3-us-west-2.amazonaws.com/democracyearth/landing/metamask-splash.png">
              <source src="https://s3-us-west-2.amazonaws.com/democracyearth/landing/MetaMask.mp4" type="video/mp4" />
            </video>
          </div>
          :
          null
        }
        {metamaskLoginActive ?
          <div className="extra">
            <a id="signup" href="https://metamask.io/" rel="noopener noreferrer" target="_blank">{TAPi18n.__('get-web3-wallet')}</a>.
          </div>
          :
          null
        }
        {metamaskLoginActive ?
          <div id="metamask-login" className="button login-button login-button-first" onClick={this.handleMetamaskLogin}>
            <img src="/images/ethereum.png" className="button-icon" alt="lock" />
            {TAPi18n.__('ethereum-web3-wallet')}
          </div>
          :
          null
        }
        {blockstackLoginActive ?
          <div id="blockstack-login" className="button login-button" onClick={this.handleBlockstackLogin}>
            <img src="/images/blockstack.png" className="button-icon" alt="lock" />
            {TAPi18n.__('blockstack-id')}
          </div>
          :
          null
        }
        {/* <div id="twitter-login" className="button button-social twitter" onClick={this.handleTwitterLogin} >{{_ 'twitter'}}</div> */}
      </div>
    );
  }
}

SocialMediaLogin.propTypes = {
  agoraMode: PropTypes.bool.isRequired,
};
