import React from 'react';
import PropTypes from 'prop-types';

import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';

import Account from 'components/Account/Account';
import DAO from 'components/DAO/DAO';
import Stamp from 'components/Stamp/Stamp';
import Transaction from 'components/Transaction/Transaction';

import { config } from 'config'
import 'styles/Dapp.css';

const client = new ApolloClient({
  uri: config.graph.moloch,
  cache: new InMemoryCache(),
});

const GET_VOTES = gql`
  {
    votes(first: 15, orderBy:createdAt, orderDirection:desc) {
      id
      createdAt
      uintVote
      molochAddress
      memberAddress
      proposal {
        details
        id
      }
      member {
        shares
      }
    }
  }
`;


/**
* @summary displays the contents of a poll
*/
/**
* @summary graph query of token
* @param {string} publicAddress of the token contract
* @param {string} quantity with a big number
* @param {string} symbol with a ticker
* @param {string} decimal numbers this token takes
*/
const VoteQuery = () => {
  const { loading, error, data } = useQuery(GET_VOTES);

  if (loading) {
    return (
      <div className="token">
        <div className="token-ticker">
          <div className="option-placeholder token-placeholder" />
        </div>
      </div>
    );
  }
  if (error) return `Error! ${error}`;

  return data.votes.map((vote) => {
    return (
      <div key={vote.id} className="event-vote">
        <Account publicAddress={vote.memberAddress} width="16px" height="16px" />
        <DAO publicAddress={vote.molochAddress} width="16px" height="16px" />
        <Transaction uintVote={vote.uintVote} description={vote.proposal.details} quantity={vote.member.shares} />
        <Stamp timestamp={vote.createdAt} format="timeSince" />
      </div>
    );
  });
};

VoteQuery.propTypes = {
  addresss: PropTypes.string,
};


/**
* @summary renders a post in the timeline
*/
const Vote = (props) => {
  return (
    <ApolloProvider client={client}>
      <VoteQuery address={props.address} />
    </ApolloProvider>
  );
};

Vote.propTypes = VoteQuery.propTypes;


export default Vote;
