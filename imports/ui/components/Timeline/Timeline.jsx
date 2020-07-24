import { Meteor } from 'meteor/meteor';
import React from 'react';
import ApolloClient, { InMemoryCache } from 'apollo-boost';
import { ApolloProvider, Query } from 'react-apollo';
import { TAPi18n } from 'meteor/tap:i18n';
import PropTypes from 'prop-types';

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
import Survey from '/imports/ui/components/Poll/Survey';
import Social from '/imports/ui/components/Social/Social';

import { defaults } from '/lib/const';
import { MOLOCHS } from '/imports/ui/components/Timeline/queries';

const client = new ApolloClient({
  uri: Meteor.settings.public.graph.molochs,
  cache: new InMemoryCache(),
});

const _getPercentage = (percentageAmount, remainder) => {
  return parseFloat((percentageAmount * 100) / (percentageAmount + remainder), 10);
};

const Feed = (props) => {
  return (
    <Query
      query={props.query}
    >
      {({ loading, error, data }) => {
        if (loading) return <Placeholder />;
        if (error) return <p>Error!</p>;

        console.log(data.proposals);

        const accountAddress = Meteor.user() ? Meteor.user().username : null;
        const daoName = 'MolochDAO';
        const timestamp = new Date().getTime();

        return data.proposals.map((proposal) => {
          const totalVoters = parseInt(proposal.yesVotes.toNumber() + proposal.noVotes.toNumber(), 10).toString();
          const yesPercentage = _getPercentage(proposal.yesShares.toNumber(), proposal.noShares.toNumber()).toString();
          const noPercentage = _getPercentage(proposal.noShares.toNumber(), proposal.yesShares.toNumber()).toString();
          const daoAddress = proposal.moloch.id;
          const status = (proposal.didPass) ? 'PASSED' : 'FAILED';
          const isPoll = (proposal.startingPeriod !== '0');
          const url = `/proposal/${proposal.id}`;

          return (
            <Post
              key={proposal.id} accountAddress={accountAddress} href={url}
              description={proposal.details} memberAddress={proposal.memberAddress}
              daoAddress={daoAddress}
            >
              <Contract>
                <Parameter label={TAPi18n.__('moloch-applicant')}>
                  <Account publicAddress={proposal.applicant} width="24px" height="24px" />
                </Parameter>
                <Parameter label={TAPi18n.__('moloch-request')}>
                  <Token quantity={proposal.sharesRequested.toString()} symbol="SHARES" />
                </Parameter>
                <Parameter label={TAPi18n.__('moloch-tribute')}>
                  <Token quantity={proposal.tributeOffered} publicAddress={proposal.tributeToken} symbol={proposal.tributeTokenSymbol} decimals={proposal.tributeTokenDecimals} />
                </Parameter>
              </Contract>
              {(isPoll) ?
                <Poll>
                  <Countdown
                    now={timestamp}
                    votingPeriodBegins={proposal.votingPeriodStarts} votingPeriodEnds={proposal.votingPeriodEnds} 
                    gracePeriodEnds={proposal.gracePeriodEnds} totalVoters={totalVoters}
                  />
                  <Survey>
                    <Choice
                      now={timestamp}
                      accountAddress={accountAddress} daoName={daoName} publicAddress={proposal.moloch.id}
                      proposalIndex={proposal.proposalIndex} label={TAPi18n.__('yes')} percentage={yesPercentage}
                      voteValue={defaults.YES} votingPeriodEnds={proposal.votingPeriodEnds} votingPeriodBegins={proposal.votingPeriodStarts}
                    >
                      <Token quantity={proposal.yesVotes} symbol="SHARES" />
                    </Choice>
                    <Choice
                      now={timestamp}
                      accountAddress={accountAddress} daoName={daoName} publicAddress={proposal.moloch.id}
                      proposalIndex={proposal.proposalIndex} label={TAPi18n.__('no')} percentage={noPercentage}
                      voteValue={defaults.NO} votingPeriodEnds={proposal.votingPeriodEnds} votingPeriodBegins={proposal.votingPeriodStarts}
                    >
                      <Token quantity={proposal.noVotes} symbol="SHARES" />
                    </Choice>
                  </Survey>
                  <Period
                    now={timestamp}
                    status={status} votingPeriodBegins={proposal.votingPeriodStarts}
                    votingPeriodEnds={proposal.votingPeriodEnds} gracePeriodEnds={proposal.gracePeriodEnds}
                  />
                </Poll>
              :
                null
              }
              <Social url={url} description={proposal.details}>
                <Stamp timestamp={proposal.createdAt} />
              </Social>
            </Post>
          );
        });
      }}
    </Query>
  );
};

Feed.propTypes = {
  query: PropTypes.instanceOf(Object),
};

const Timeline = () => {
  return (
    <ApolloProvider client={client}>
      <Feed query={MOLOCHS} />
    </ApolloProvider>
  );
};

export default Timeline;
