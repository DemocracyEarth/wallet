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
          proposals(first: 25) {
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

        console.log(data.proposals);

        let accountAddress;
        if (Meteor.user()) {
          accountAddress = Meteor.user().username;
        }

        return data.proposals.map((proposal) => {
          return (
            <Post
              key={proposal.id}
              id={`molochdao-${proposal.proposalIndex}`}
              daoName={'MolochDAO'}
              accountAddress={accountAddress}
              publicAddress={'0x1fd169a4f5c59acf79d0fd5d91d1201ef1bce9f1'}
              description={proposal.details}
              memberAddress={proposal.memberAddress}
              applicantAddress={proposal.applicant.applicantAddress}
              timestamp={proposal.timestamp}
              sharesRequested={proposal.sharesRequested}
              tokenTribute={proposal.tokenTribute}
              yesVotes={proposal.yesVotes}
              noVotes={proposal.noVotes}
              votingPeriodBegins={proposal.votingPeriodBegins}
              votingPeriodEnds={proposal.votingPeriodEnds}
              gracePeriodEnds={proposal.gracePeriodEnds}
              yesShares={proposal.yesShares}
              noShares={proposal.noShares}
              proposalIndex={proposal.proposalIndex}
              status={proposal.status}
            />
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
