import React, { useEffect } from 'react';
import ApolloClient, { InMemoryCache } from 'apollo-boost';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import PropTypes from 'prop-types';

import Account from 'components/Account/Account';
import Post from 'components/Post/Post';
import Stamp from 'components/Stamp/Stamp';
import Parameter from 'components/Parameter/Parameter';
import Token from 'components/Token/Token';
import Countdown from 'components/Countdown/Countdown';
import Poll from 'components/Poll/Poll';
import Choice from 'components/Choice/Choice';
import Period from 'components/Period/Period';
import Contract from 'components/Contract/Contract';
import Placeholder from 'components/Timeline/Placeholder';
import Survey from 'components/Poll/Survey';
import Social from 'components/Social/Social';
import Flag from 'components/Flag/Flag';
import Toggle from 'components/Toggle/Toggle';

import { query } from 'components/Timeline/queries';
import { config } from 'config'
import { defaults, view as routerView, period as routerPeriod } from 'lib/const';
import { uniqBy, orderBy as _orderBy } from 'lodash';

import i18n from 'i18n';
import notFound from 'images/not-found.svg';
import 'styles/Dapp.css';

/**
 * @summary retrieves the corresponding query for the timeline.
 * @param {string} view based on router context
 * @param {string} field if required for a specific query
 */
const composeQuery = (view, field, period) => {
  if (view === routerView.HOME) {
    return query.GET_PROPOSALS;
  }

  if (view === routerView.DAO) {
    return query.GET_PROPOSALS_DAO;
  }

  if (view === routerView.PROPOSAL) {
    return query.GET_PROPOSAL_ID;
  }

  if (view === routerView.PERIOD) {
    switch (period) {
      case routerPeriod.QUEUE:
        return query.GET_PROPOSALS_PERIOD_QUEUE;
      case routerPeriod.VOTING:
        return query.GET_PROPOSALS_PERIOD_VOTING;
      case routerPeriod.GRACE:
        return query.GET_PROPOSALS_PERIOD_GRACE;
      case routerPeriod.READY:
        return query.GET_PROPOSALS_PERIOD_READY;
      case routerPeriod.REJECTED:
        return query.GET_PROPOSALS_PERIOD_REJECTED;
      case routerPeriod.APPROVED:
        return query.GET_PROPOSALS_PERIOD_APPROVED;
      default:
    }
  }

  switch(field) {
    case 'applicant':
      return query.GET_PROPOSALS_APPLICANT;
    case 'memberAddress':
      return query.GET_PROPOSALS_MEMBER;
    default:
      return query.GET_PROPOSALS;
  }
}

const client = new ApolloClient({
  uri: config.graph.moloch,
  cache: new InMemoryCache(),
});

const _getPercentage = (percentageAmount, remainder) => {
  return parseFloat((percentageAmount * 100) / (percentageAmount + remainder), 10);
};

const Feed = (props) => {
  const { address, first, skip, orderBy, orderDirection, proposalId } = props;
  const now = Math.floor(new Date().getTime() / 1000);
  console.log(`proposalId: ${proposalId} && ${typeof proposalId}`);
  const { loading, error, data } = useQuery(composeQuery(props.view, props.field, props.period), { variables: { address, first, skip, orderBy, orderDirection, now, proposalId } });

  // fx
  window.scroll({ top: 0 });

  useEffect(() => {
    document.getElementById('alternative-feed').style.minHeight = `${document.getElementById('proposals').scrollHeight}px`;
  });

  if (loading) return <Placeholder />;
  if (error) return <p>Error!</p>;

  const accountAddress = props.address;
  const timestamp = Math.floor(new Date().getTime() / 1000);

  if (data.asProposer || data.asApplicant) {
    data.proposals = _orderBy(uniqBy(data.asProposer.concat(data.asApplicant), 'id'), 'createdAt', 'desc');
  }

  console.log(data);

  if (data.proposals.length === 0) {
    return (
      <div className="empty-feed">
        <img className="empty-icon" src={notFound} alt="" />
        <h1>{i18n.t('moloch-empty-feed')}</h1>
        {i18n.t('moloch-empty-feed-detail')}
      </div>
    );
  }

  return data.proposals.map((proposal) => {
    const totalVoters = String(parseInt(Number(proposal.yesVotes) + Number(proposal.noVotes), 10));
    const yesPercentage = String(_getPercentage(Number(proposal.yesShares), Number(proposal.noShares)));
    const noPercentage = String(_getPercentage(Number(proposal.noShares), Number(proposal.yesShares)));
    const daoAddress = proposal.moloch.id;
    const isPoll = (proposal.startingPeriod !== '0');
    const isUnsponsored = (!isPoll && proposal.molochVersion !== '1' && !proposal.sponsored && !proposal.cancelled);
    const url = `/proposal/${proposal.id}`;

    let status;
    if (proposal.didPass && proposal.processed) {
      status = 'PASSED';
    }
    if (!proposal.didPass && proposal.processed) {
      status = 'FAILED';
    }
    if (!proposal.processed) {
      status = 'PENDING';
    }
    if (proposal.cancelled) {
      status = 'CANCELLED';
    }

    const noShares = (proposal.sharesRequested === '0');
    const noTribute = (proposal.tributeOffered === '0');
    const noPayment = (proposal.paymentRequested === '0');
    const noLoot = (proposal.lootRequested === '0');
    const noApplicant = (proposal.applicant === '0x0000000000000000000000000000000000000000');
    const noSponsor = (!proposal.sponsored);
    const noConditions = (noShares && noTribute && noPayment && noApplicant && noSponsor && noLoot && !proposal.whitelist && !proposal.guildkick);

    return (
      <Post
        key={proposal.id} accountAddress={accountAddress} href={url}
        description={proposal.details} memberAddress={proposal.proposer}
        daoAddress={daoAddress}
      >
        <Contract hidden={noConditions}>
          {(!noSponsor) ?
            <Parameter label={i18n.t('moloch-sponsored-by')}>
              <Account publicAddress={proposal.sponsor} width="16px" height="16px" />
            </Parameter>
            :
            null
          }
          {(!noApplicant) ?
            <Parameter label={i18n.t('moloch-applicant')}>
              <Account publicAddress={proposal.applicant} width="16px" height="16px" />
            </Parameter>
            :
            null
          }
          {(!noShares) ?
            <Parameter label={i18n.t('moloch-request')}>
              <Token quantity={String(proposal.sharesRequested)} symbol="SHARES" />
            </Parameter>
            :
            null
          }
          {(!noLoot) ?
            <Parameter label={i18n.t('moloch-loot')}>
              <Token quantity={String(proposal.lootRequested)} symbol="SHARES" />
            </Parameter>
            :
            null
          }
          {(!noTribute) ?
            <Parameter label={i18n.t('moloch-tribute')}>
              <Token quantity={proposal.tributeOffered} publicAddress={proposal.tributeToken} symbol={proposal.tributeTokenSymbol} decimals={proposal.tributeTokenDecimals} />
            </Parameter>
            :
            null
          }
          {(!noPayment) ?
            <Parameter label={i18n.t('moloch-payment')}>
              <Token quantity={proposal.paymentRequested} publicAddress={proposal.paymentToken} symbol={proposal.paymentTokenSymbol} decimals={proposal.paymentTokenDecimals} />
            </Parameter>
            :
            null
          }
          {(proposal.whitelist) ?
            <Toggle label={i18n.t('moloch-token-whitelist')} checked={true} disabled={true} />
            :
            null
          }
          {(proposal.guildkick) ?
            <Toggle label={i18n.t('moloch-token-guildkick')} checked={true} disabled={true} />
            :
            null
          }
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
                accountAddress={accountAddress} publicAddress={proposal.moloch.id}
                proposalIndex={proposal.proposalIndex} label={i18n.t('yes')} percentage={yesPercentage}
                voteValue={defaults.YES} votingPeriodEnds={proposal.votingPeriodEnds} votingPeriodBegins={proposal.votingPeriodStarts}
              >
                <Token quantity={proposal.yesVotes} symbol="SHARES" />
              </Choice>
              <Choice
                now={timestamp}
                accountAddress={accountAddress} publicAddress={proposal.moloch.id}
                proposalIndex={proposal.proposalIndex} label={i18n.t('no')} percentage={noPercentage}
                voteValue={defaults.NO} votingPeriodEnds={proposal.votingPeriodEnds} votingPeriodBegins={proposal.votingPeriodStarts}
              >
                <Token quantity={proposal.noVotes} symbol="SHARES" />
              </Choice>
            </Survey>
            <Period
              now={timestamp} url={url}
              status={status} votingPeriodBegins={proposal.votingPeriodStarts}
              votingPeriodEnds={proposal.votingPeriodEnds} gracePeriodEnds={proposal.gracePeriodEnds}
            />
          </Poll>
          :
          null
        }
        {(isUnsponsored) ?
          <Flag styleClass={'warning period period-unsponsored'} url={url} label={i18n.t('moloch-flag-unsponsored')} tooltip={i18n.t('moloch-open-proposal')} />
        :
          null
        }
        {(proposal.cancelled) ?
          <Flag styleClass={'warning period period-cancelled'} url={url} label={i18n.t('moloch-flag-cancelled')} tooltip={i18n.t('moloch-open-proposal')} />
          :
          null
        }
        <Social url={url} description={proposal.details}>
          <Stamp url={url} timestamp={proposal.createdAt}  />
        </Social>
      </Post>
    );
  });
};

const Timeline = (props) => {
  return (
    <ApolloProvider client={client}>
      <Feed address={props.address} period={props.period} view={props.view} field={props.field} proposalId={props.proposalId} 
        first={props.first} skip={props.skip} orderBy={props.orderBy} orderDirection={props.orderDirection} />
    </ApolloProvider>
  );
};


Timeline.propTypes = {
  field: PropTypes.string,
  address: PropTypes.string,
  proposalId: PropTypes.string,
  first: PropTypes.number,
  skip: PropTypes.number,
  orderBy: PropTypes.string,
  orderDirection: PropTypes.string,
  view: PropTypes.string,
  period: PropTypes.string,
};

Feed.propTypes = Timeline.propTypes;

export default Timeline;
