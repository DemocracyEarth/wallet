import React, { Component } from 'react';
import { Router } from 'meteor/iron:router';

import { getWeb3Wallet } from '/imports/startup/both/modules/metamask';
import { defaults } from '/lib/const.js';

import Browser from '/imports/ui/components/Browser/Browser.jsx';
import Menu from '/imports/ui/components/Menu/Menu.jsx';
import Timeline from '/imports/ui/components/Timeline/Timeline.jsx';
import Ledger from '/imports/ui/components/Ledger/Ledger.jsx';

/**
* @summary renders a post in the timeline
*/
export default class Dapp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accounts: [defaults.EMPTY],
    };
  }

  async componentDidMount() {
    await this.getAccounts();
  }

  async getAccounts() {
    const web3 = getWeb3Wallet();
    const accounts = await web3.eth.getAccounts();

    if (accounts.length > 0) {
      this.setState({ accounts });
    }
  }

  getContext() {
    const current = Router.current().url.replace(window.location.origin, '');
    if (current === '/') {
      return this.state.accounts[0];
    }
    return Router.current().params.account;
  }

  render() {
    return (
      <div>
        <Browser accounts={this.state.accounts} />
        <div id="app" className="app">
          <div id="menu" className="left">
            <Menu accounts={this.state.accounts} />
          </div>
          <div id="content" className="right">
            <div id="main-feed" className="split split-left split-landing">
              <div id="proposals" className="content content-feed max100">
                <div id="non-editable-feed">
                  <Timeline />
                </div>
              </div>
            </div>
            <div id="alternative-feed" className="split split-right split-landing">
              <Ledger />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

