import React from 'react';
import PropTypes from 'prop-types';

import ApolloClient, { InMemoryCache } from 'apollo-boost';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import { useHistory } from "react-router-dom";

import Account from 'components/Account/Account';
import DAO from 'components/DAO/DAO';
import Stamp from 'components/Stamp/Stamp';
import Transaction from 'components/Transaction/Transaction';

import { view as routerView } from 'lib/const';

import parser from 'html-react-parser';
import { query } from 'components/Vote/queries'
import { config } from 'config'
import 'styles/Dapp.css';
import i18n from 'i18n';

const client = new ApolloClient({
  uri: config.graph.moloch,
  cache: new InMemoryCache(),
});

/**
 * @summary retrieves the corresponding query for the timeline.
 * @param {string} view based on router context
 */
const composeQuery = (view) => {
  switch (view) {
    case routerView.PROPOSAL:
      return query.GET_VOTES_FROM_PROPOSAL;
    case routerView.DAO: 
      return query.GET_VOTES_FROM_DAO;
    case routerView.ADDRESS:
      return query.GET_VOTES_FROM_ADDRESS;
    default:
      return query.GET_VOTES
  }
}

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
const VoteQuery = (props) => {
  const { address, first, skip, orderBy, orderDirection, proposalId } = props;  
  const { loading, error, data } = useQuery(composeQuery(props.view), { variables: { address, first, skip, orderBy, orderDirection, proposalId } });
  const history = useHistory();

  if (loading) {
    return (
      <div className="event-vote">
      </div>
    );
  }
  if (error) return <div className="empty failure">{parser(i18n.t('failure', { errorMessage: error }))}</div>;

  if (data.votes.length === 0) {
    return (
      <div className="event-vote event-vote-empty">
        <div className="preview-info">
          <div className="transaction-action transaction-action-empty">
            {i18n.t('moloch-ledger-empty')}
          </div>
        </div>
      </div>
    )
  }

  return data.votes.map((vote) => {
    return (
      <div key={vote.id} className="event-vote" onClick={() => { history.push(`/proposal/${vote.proposal.id}`); }}>
        <Account publicAddress={vote.memberAddress} width="16px" height="16px" />
        <DAO publicAddress={vote.molochAddress} width="16px" height="16px" />
        <Transaction uintVote={vote.uintVote} description={vote.proposal.details} quantity={vote.member.shares} />
        <Stamp timestamp={vote.createdAt} format="timeSince" />
      </div>
    );
  });
};

VoteQuery.propTypes = {
  proposalId: PropTypes.string,
  address: PropTypes.string,
  first: PropTypes.number,
  skip: PropTypes.number,
  orderBy: PropTypes.string,
  orderDirection: PropTypes.string,
  view: PropTypes.string,
};


/**
* @summary renders a post in the timeline
*/
const Vote = (props) => {
  return (
    <ApolloProvider client={client}>
      <VoteQuery address={props.address} view={props.view} proposalId={props.proposalId} first={props.first} skip={props.skip} orderBy={props.orderBy} orderDirection={props.orderDirection} />
    </ApolloProvider>
  );
};

Vote.propTypes = VoteQuery.propTypes;


export default Vote;
