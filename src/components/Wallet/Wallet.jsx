import React, { Component } from 'react';

import Browser from 'components/Browser/Browser';
import Menu from 'components/Menu/Menu';
import Timeline from 'components/Timeline/Timeline';
import Ledger from 'components/Ledger/Ledger';

import 'styles/Dapp.css';
import { WalletContextProvider } from 'contexts/Wallet/WalletContext';

/**
* @summary renders a post in the timeline
*/
export default class Wallet extends Component {

  render() {
    return (
      <WalletContextProvider>
        <div>
          <Browser address={this.state.address} walletConnect={this.onConnect} walletReset={this.reset} />
          <div id="app" className="app">
            <div id="menu" className="left">
              <Menu address={this.state.address} />
            </div>
            <div id="content" className="right">
              <div id="main-feed" className="split split-left split-landing">
                <div id="proposals" className="content content-feed max100">
                  <div id="non-editable-feed">
                    <Timeline address={this.state.address} />
                  </div>
                </div>
              </div>
              <div id="alternative-feed" className="split split-right split-landing">
                <Ledger />
              </div>
            </div>
          </div>
        </div>
      </WalletContextProvider>
    );
  }
}
