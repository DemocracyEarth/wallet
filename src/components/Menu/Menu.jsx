import React, { useContext } from "react";

import ApolloClient, { InMemoryCache } from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import PropTypes from 'prop-types';

import Sidebar from 'components/Menu/Sidebar';
import { ConnectedAccount } from 'components/Dapp/Dapp';
import { config } from 'config'

const client = new ApolloClient({
  uri: config.graph.moloch,
  cache: new InMemoryCache(),
});

/**
* @summary renders a post in the timeline
*/

const Menu = (props) => {
  const connectedAccount = useContext(ConnectedAccount)
  
  return (
    <ApolloProvider client={client}>
      <Sidebar accountAddress={connectedAccount} address={props.address} view={props.view} proposalId={props.proposalId} param={props.param} />
    </ApolloProvider>
  );
};

Menu.propTypes = {
  address: PropTypes.string,
  view: PropTypes.string,
  proposalId: PropTypes.string,
  param: PropTypes.string
};

export default Menu;
