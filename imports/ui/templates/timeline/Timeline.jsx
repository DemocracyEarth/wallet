import { Meteor } from 'meteor/meteor';
import React from 'react';
import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
import { ApolloProvider, Query } from 'react-apollo';

import Post from '/imports/ui/templates/timeline/post/Post.jsx';

const client = new ApolloClient({
  uri: Meteor.settings.public.graph.timeline,
  cache: new InMemoryCache(),
});

const ProposalQuery = () => {
  return (
    <Query
      query={gql`
        {
          proposals(first: 5) {
            id
            timestamp
            proposalIndex
            startingPeriod
            member {
              id
            }
            memberAddress
            applicant {
              applicantAddress
            }
            tokenTribute
            sharesRequested
            yesVotes
            noVotes
            yesShares
            noShares
            details
            processed
            status
            votingPeriodBegins
            votingPeriodEnds
            gracePeriodEnds
          }
        }
      `}
    >
      {({ loading, error, data }) => {
        if (loading) return <p>Loading... </p>;
        if (error) return <p>Error!</p>;

        console.log(data);

        return data.proposals.map((proposal) => {
          return (
            <Post id={`molochdao-${proposal.id}`} daoName={'molochdao'} description={proposal.details} />
          );
        });
      }}
    </Query>
  );
};

const Timeline = () => {
  return (
    <ApolloProvider client={client}>
      <ProposalQuery />
    </ApolloProvider>
  );
};

export default Timeline;
