import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';

import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { useQuery } from '@apollo/react-hooks';

const client = new ApolloClient({
  uri: Meteor.settings.public.graph.molochs,
  cache: new InMemoryCache(),
});

const GET_VOTES = gql`
  {
    votes(first: 25, orderBy:createdAt, orderDirection:desc) {
      id
      uintVote
      molochAddress
      member {
        id
      }
      proposal {
        details
        id
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
const EventQuery = (props) => {
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

  return (
    <div className="poll-survey">
      {props.children}
    </div>
  );
};

EventQuery.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

/**
* @summary renders a post in the timeline
*/
const Event = () => {
  return (
    <ApolloProvider client={client}>
      <EventQuery />
    </ApolloProvider>
  );
};

Event.propTypes = EventQuery.propTypes;

export default Event;
