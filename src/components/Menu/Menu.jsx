import React, { Component } from 'react';

import ApolloClient, { InMemoryCache } from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import PropTypes from 'prop-types';

import MenuQuery from 'components/Menu/MenuQuery.jsx';
import { config } from 'config'

const client = new ApolloClient({
  uri: config.graph.moloch,
  cache: new InMemoryCache(),
});

/**
* @summary renders a post in the timeline
*/
const Menu = (props) => {
  return (
    <ApolloProvider client={client}>
      <MenuQuery address={props.address} />
    </ApolloProvider>
  );
};

Menu.propTypes = {
  address: PropTypes.string,
};

export default Menu;
