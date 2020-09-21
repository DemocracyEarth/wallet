import React from 'react';

import ApolloClient, { InMemoryCache } from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import PropTypes from 'prop-types';

import Sidebar from 'components/Menu/Sidebar';
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
      <Sidebar address={props.address} view={props.view} />
    </ApolloProvider>
  );
};

Menu.propTypes = {
  address: PropTypes.string,
  view: PropTypes.string,
};

export default Menu;
