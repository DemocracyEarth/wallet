import { Meteor } from 'meteor/meteor';
import React from 'react';
import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
import { ApolloProvider, Query } from 'react-apollo';
import { TAPi18n } from 'meteor/tap:i18n';

import Account from '/imports/ui/components/Account/Account.jsx';
import Post from '/imports/ui/components/Post/Post.jsx';
import Stamp from '/imports/ui/components/Stamp/Stamp.jsx';
import Parameter from '/imports/ui/components/Parameter/Parameter.jsx';
import Token from '/imports/ui/components/Token/Token.jsx';
import Countdown from '/imports/ui/components/Countdown/Countdown.jsx';
import Poll from '/imports/ui/components/Poll/Poll.jsx';
import Choice from '/imports/ui/components/Choice/Choice.jsx';
import Period from '/imports/ui/components/Period/Period.jsx';
import Contract from '/imports/ui/components/Contract/Contract.jsx';
import Placeholder from '/imports/ui/components/Timeline/Placeholder.jsx';

import { defaults } from '/lib/const';

const client = new ApolloClient({
  uri: Meteor.settings.public.graph.timeline,
  cache: new InMemoryCache(),
});

const _getPercentage = (percentageAmount, remainder) => {
  return parseFloat((percentageAmount * 100) / (percentageAmount + remainder), 10);
};

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
        if (loading) return <Placeholder />;
        if (error) return <p>Error!</p>;

        console.log(data.proposals);

        const accountAddress = Meteor.user() ? Meteor.user().username : null;
        const daoName = 'MolochDAO';
        const publicAddress = '0x1fd169a4f5c59acf79d0fd5d91d1201ef1bce9f1';
        const timestamp = new Date().getTime();

        return data.proposals.map((proposal) => {
          const totalVoters = parseInt(proposal.yesVotes.toNumber() + proposal.noVotes.toNumber(), 10).toString();
          const yesPercentage = _getPercentage(proposal.yesShares.toNumber(), proposal.noShares.toNumber()).toString();
          const noPercentage = _getPercentage(proposal.noShares.toNumber(), proposal.yesShares.toNumber()).toString();

          return (
            <Post
              key={proposal.id} accountAddress={accountAddress}
              description={proposal.details} memberAddress={proposal.memberAddress}
            >
              <Contract>
                <Parameter label={TAPi18n.__('moloch-applicant')}>
                  <Account publicAddress={proposal.applicant.applicantAddress} width="24px" height="24px" />
                </Parameter>
                <Parameter label={TAPi18n.__('moloch-request')}>
                  <Token quantity={proposal.sharesRequested.toString()} symbol="SHARES" />
                </Parameter>
                <Parameter label={TAPi18n.__('moloch-tribute')}>
                  <Token quantity={proposal.tokenTribute.toString()} symbol="WETH" />
                </Parameter>
              </Contract>
              <Stamp timestamp={proposal.timestamp} />
              <Countdown
                now={timestamp}
                votingPeriodBegins={proposal.votingPeriodBegins} votingPeriodEnds={proposal.votingPeriodEnds} 
                gracePeriodEnds={proposal.gracePeriodEnds} totalVoters={totalVoters}
              />
              <Poll>
                <Choice
                  now={timestamp}
                  accountAddress={accountAddress} daoName={daoName} publicAddress={publicAddress}
                  proposalIndex={proposal.proposalIndex} label={TAPi18n.__('yes')} percentage={yesPercentage}
                  voteValue={defaults.YES} votingPeriodEnds={proposal.votingPeriodEnds} votingPeriodBegins={proposal.votingPeriodBegins}
                >
                  <Token quantity={proposal.yesVotes} symbol="SHARES" />
                </Choice>
                <Choice
                  now={timestamp}
                  accountAddress={accountAddress} daoName={daoName} publicAddress={publicAddress}
                  proposalIndex={proposal.proposalIndex} label={TAPi18n.__('no')} percentage={noPercentage}
                  voteValue={defaults.NO} votingPeriodEnds={proposal.votingPeriodEnds} votingPeriodBegins={proposal.votingPeriodBegins}
                >
                  <Token quantity={proposal.noVotes} symbol="SHARES" />
                </Choice>
              </Poll>
              <Period
                now={timestamp}
                status={proposal.status} votingPeriodBegins={proposal.votingPeriodBegins}
                votingPeriodEnds={proposal.votingPeriodEnds} gracePeriodEnds={proposal.gracePeriodEnds}
              />
            </Post>
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
