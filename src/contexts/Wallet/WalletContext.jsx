import React, { createContext, useEffect } from "react";

import { defaults } from 'lib/const';

import Web3 from 'web3';
import Fortmatic from 'fortmatic';
import Web3Modal from 'web3modal';
import UniLogin from '@unilogin/provider';
import { Authereum } from 'authereum';
import Torus from '@toruslabs/torus-embed';
import WalletConnectProvider from '@walletconnect/web3-provider';

import { config } from 'config'

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

const providerOptions = {
  fortmatic: {
    package: Fortmatic,
    options: {
      key: config.keys.fortmatic,
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
      infuraId: config.keys.infura,
    },
  },
};

export const WalletContext = createContext({
  address: defaults.EMPTY,
  onConnect: () => { },
  reset: () => { }
});

export const WalletContextProvider = ({ children }) => {

  const [state, setState] = useState(INITIAL_STATE);

  const web3Modal = useMemo(() => new Web3Modal({
    network: 'mainnet',
    cacheProvider: true,
    providerOptions,
  }), []);

  const onReset = useMemo(() => async () => {
    const { web3 } = state;
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    web3Modal.clearCachedProvider();
    setState(INITIAL_STATE);
  }, [state.web3])

  const subscribeProvider = useMemo(() => async (provider) => {
    if (!provider.on) {
      return;
    }
    provider.on('close', onReset);

    provider.on('accountsChanged', async (accounts) => {
      setState(state => ({ ...state, address: accounts[0] }));
    });

    provider.on('chainChanged', async (chainId) => {
      const { web3 } = state;
      const networkId = await web3.eth.net.getId();
      setState(state => ({ ...state, chainId, networkId }));
    });

    provider.on('networkChanged', async (networkId) => {
      const { web3 } = state;
      const chainId = await web3.eth.chainId();
      setState(state => ({ ...state, chainId, networkId }));
    });
  }, [state.web3, onReset])

  const onConnect = useMemo(() => async () => {
    const provider = await web3Modal.connect();
    subscribeProvider(provider);
    const web3 = new Web3(provider);

    const accounts = await web3.eth.getAccounts();
    const address = accounts[0];
    const networkId = await web3.eth.net.getId();

    setState(state => ({
      ...state,
      web3,
      provider,
      connected: true,
      address,
      networkId,
    }));
  }, [])

  useEffect(() => onConnect, [])

  return <WalletContext.Provider value={{
    address: state.address,
    onConnect,
    onReset
  }} >
    {children}
  </WalletContext.Provider >
}