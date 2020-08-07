import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { defaults } from '/lib/const.js';

import Browser from '/imports/ui/components/Browser/Browser.jsx';
import Menu from '/imports/ui/components/Menu/Menu.jsx';
import Timeline from '/imports/ui/components/Timeline/Timeline.jsx';
import Ledger from '/imports/ui/components/Ledger/Ledger.jsx';

import Web3Modal from 'web3modal';
import UniLogin from '@unilogin/provider';
import { Authereum } from 'authereum';
import Torus from '@toruslabs/torus-embed';
import WalletConnectProvider from '@walletconnect/web3-provider';

const Web3 = require('web3');
const Fortmatic = require('fortmatic');


const providerOptions = {
  fortmatic: {
    package: Fortmatic,
    options: {
      key: Meteor.settings.public.web3.fortmatic,
    },
  },
  unilogin: {
    package: UniLogin,
  },
  authereum: {
    package: Authereum,
  },
  torus: {
    package: Torus,
  },
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: Meteor.settings.public.web3.infura,
    },
  },
};

const INITIAL_STATE = {
  fetching: false,
  address: defaults.EMPTY,
  web3: null,
  provider: null,
  connected: false,
  chainId: 1,
  networkId: 1,
  assets: [],
  showModal: false,
  pendingRequest: false,
  result: null,
};

/**
* @summary renders a post in the timeline
*/
export default class Wallet extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };

    this.web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
      providerOptions,
    });

    this.onConnect = this.onConnect.bind(this);
    this.reset = this.reset.bind(this);
  }

  async componentDidMount() {
    if (this.web3Modal.cachedProvider) {
      this.onConnect();
    }
  }

  async onConnect() {
    const provider = await this.web3Modal.connect();
    await this.subscribeProvider(provider);
    const web3 = new Web3(provider);

    const accounts = await web3.eth.getAccounts();
    const address = accounts[0];
    const networkId = await web3.eth.net.getId();

    await this.setState({
      web3,
      provider,
      connected: true,
      address,
      networkId,
    });
  }

  async subscribeProvider(provider) {
    if (!provider.on) {
      return;
    }
    provider.on('close', () => { this.resetApp(); });

    provider.on('accountsChanged', async (accounts) => {
      await this.setState({ address: accounts[0] });
    });

    provider.on('chainChanged', async (chainId) => {
      const { web3 } = this.state;
      const networkId = await web3.eth.net.getId();
      await this.setState({ chainId, networkId });
    });

    provider.on('networkChanged', async (networkId) => {
      const { web3 } = this.state;
      const chainId = await web3.eth.chainId();
      await this.setState({ chainId, networkId });
    });
  }

  async reset() {
    const { web3 } = this.state;
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    await this.web3Modal.clearCachedProvider();
    this.setState({ ...INITIAL_STATE });
  }

  render() {
    return (
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
