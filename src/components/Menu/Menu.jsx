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
export default class Menu extends Component {
  getContext() {
    const current = '/' // TODO: User router Router.current().url.replace(window.location.origin, '');
    if (current === '/') {
      return this.props.address;
    }
    return null // TODO: Router.current().params.account;
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <MenuQuery address={this.getContext()} />
      </ApolloProvider>
    );
  }
}

Menu.propTypes = {
  address: PropTypes.string,
};
