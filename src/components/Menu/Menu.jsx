import React, { useContext } from 'react';

import ApolloClient, { InMemoryCache } from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';

import MenuQuery from 'components/Menu/MenuQuery.jsx';
import { config } from 'config'
import { WalletContext } from 'contexts/Wallet/WalletContext';

const client = new ApolloClient({
  uri: config.graph.moloch,
  cache: new InMemoryCache(),
});

/**
* @summary renders a post in the timeline
*/
const Menu = () => {
  const { address } = useContext(WalletContext);
  const getContext = () => {
    const current = '/' // TODO: User router Router.current().url.replace(window.location.origin, '');
    if (current === '/') {
      return address;
    }
    return null // TODO: Router.current().params.account;
  }

  return (
    <ApolloProvider client={client}>
      <MenuQuery address={getContext()} />
    </ApolloProvider>
  );

}

Menu.propTypes = {};

export default Menu;