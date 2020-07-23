import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';

import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { useQuery } from '@apollo/react-hooks';

import Account from '/imports/ui/components/Account/Account.jsx';
import DAO from '/imports/ui/components/DAO/DAO.jsx';
import Stamp from '/imports/ui/components/Stamp/Stamp.jsx';
import Token from '/imports/ui/components/Token/Token.jsx';
import Preview from '/imports/ui/components/Preview/Preview.jsx';

const client = new ApolloClient({
  uri: Meteor.settings.public.graph.molochs,
  cache: new InMemoryCache(),
});

const GET_VOTES = gql`
  {
    votes(first: 7, orderBy:createdAt, orderDirection:desc) {
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

  console.log(data);

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
      <div id="non-editable-feed" className="ledger">
        <div className="event-vote">
          <Account publicAddress={vote.memberAddress} width="16px" height="16px" />
          <DAO publicAddress={vote.molochAddress} width="16px" height="16px" />
          <Token quantity={vote.member.shares} symbol="SHARES" />
          <Stamp timestamp={vote.createdAt} format="COMPRESSED" />
          <Preview uintVote={vote.uintVote} description={vote.proposal.details} />
        </div>
      </div>
    );
  });
};

VoteQuery.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

/**
* @summary renders a post in the timeline
*/
const Vote = () => {
  return (
    <ApolloProvider client={client}>
      <VoteQuery />
    </ApolloProvider>
  );
};

Vote.propTypes = VoteQuery.propTypes;

export default Vote;
