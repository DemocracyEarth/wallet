import { Meteor } from 'meteor/meteor';
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

const web3Modal = new Web3Modal({
  network: 'mainnet',
  cacheProvider: true,
  disableInjectedProvider: false,
  providerOptions,
});


const _subscribeProvider = async (provider) => {
  if (!provider.on) {
    return;
  }
  // Subscribe to accounts change
  provider.on('accountsChanged', (accounts) => {
    console.log(accounts);
  });

  // Subscribe to chainId change
  provider.on('chainChanged', (chainId) => {
    console.log(chainId);
  });

  // Subscribe to provider connection
  provider.on('connect', (info) => {
    console.log(info);
  });
};

/**
* @summary setups a wallet either via plugin or iframe
*/
const _connectWallet = async () => {
  console.log('connect web3');
  let wallet;
  try {
    const provider = await web3Modal.connect();
    wallet = new Web3(provider);
    _subscribeProvider(provider);
  } catch (err) {
    console.log(err);
  }

  return wallet;
};

const _disconnectWallet = async () => {
  await web3Modal.clearCachedProvider();
};

/**
* @summary check web3 plugin and connects to code obejct
*/
const _getWallet = async () => {
  if (window.web3) {
    return new Web3(window.web3.currentProvider);
  }
  return await _connectWallet();
};

export const getWallet = _getWallet;
export const connectWallet = _connectWallet;
export const disconnectWallet = _disconnectWallet;