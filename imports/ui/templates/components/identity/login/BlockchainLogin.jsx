import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { TAPi18n } from 'meteor/tap:i18n';

export default class BlockchainLogin extends Component {
  constructor(props) {
    super(props);

    this.handleQrSignin = this.handleQrSignin.bind(this);
  }

  handleQrSignin() {
    Meteor.loginWithPassword('napoleonDynamite', 'xdwcqc');
  }

  render() {
    return (
      <div className="login">
        <div dangerouslySetInnerHTML={{ __html: TAPi18n.__('use-blockchain-id') }} />
        <img src="/images/qr.png" className="qr-code qr-sign" alt="qrplaceholder.png" onClick={this.handleQrSignin} />
        <div className="login-label">
          {TAPi18n.__('scan-with')} <a>{TAPi18n.__('phone-app')}</a>.
        </div>
      </div>
    );
  }
}
