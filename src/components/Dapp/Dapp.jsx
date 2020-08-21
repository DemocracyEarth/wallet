import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

// dapp
import Browser from 'components/Browser/Browser';
import Layout from 'components/Layout/Layout';

// settings
import 'styles/Dapp.css';
import { WalletContextProvider } from 'contexts/Wallet/WalletContext';


/**
* @summary renders a post in the timeline
*/
export default class Dapp extends Component {


  render() {
    return (
      <Router>
        <WalletContextProvider>
          <Browser />
          <Switch>
            <Route path="/" exact>
              <Layout />
            </Route>
          </Switch>
        </WalletContextProvider>
      </Router>
    );
  }
}
