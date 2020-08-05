import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { Router } from 'meteor/iron:router';

import ApolloClient, { InMemoryCache } from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import PropTypes from 'prop-types';

import MenuQuery from '/imports/ui/components/Menu/MenuQuery.jsx';

const client = new ApolloClient({
  uri: Meteor.settings.public.graph.molochs,
  cache: new InMemoryCache(),
});

/**
* @summary renders a post in the timeline
*/
export default class Menu extends Component {
  getContext() {
    const current = Router.current().url.replace(window.location.origin, '');
    if (current === '/') {
      return this.props.accounts[0];
    }
    return Router.current().params.account;
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <MenuQuery account={this.getContext()} />
      </ApolloProvider>
    );
  }
}

Menu.propTypes = {
  accounts: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
  ]),
};
