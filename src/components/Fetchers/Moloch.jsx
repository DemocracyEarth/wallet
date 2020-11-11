import { useMemo } from 'react';
import { InMemoryCache, HttpLink  } from 'apollo-boost';
import { ApolloClient } from '@apollo/client';

import PropTypes from 'prop-types';

import { getQuery } from 'components/Timeline/queries';
import { config } from 'config'
import { view as routerView, period as routerPeriod } from 'lib/const';

/**
 * @summary retrieves the corresponding query for the timeline.
 * @param {string} field if required for a specific query
 */
const composeQuery = (view, period) => {
  switch (view) {
    case routerView.HOME:
      return getQuery('GET_PROPOSALS');
    case routerView.DAO:
      return getQuery('GET_PROPOSALS_DAO', period);
    case routerView.PROPOSAL:
      return getQuery('GET_PROPOSAL_ID');
    case routerView.PERIOD:
      switch (period) {
        case routerPeriod.QUEUE:
          return getQuery('GET_PROPOSALS_PERIOD_QUEUE');
        case routerPeriod.VOTING:
          return getQuery('GET_PROPOSALS_PERIOD_VOTING');
        case routerPeriod.GRACE:
          return getQuery('GET_PROPOSALS_PERIOD_GRACE');
        case routerPeriod.READY:
          return getQuery('GET_PROPOSALS_PERIOD_READY');
        case routerPeriod.REJECTED:
          return getQuery('GET_PROPOSALS_PERIOD_REJECTED');
        case routerPeriod.APPROVED:
          return getQuery('GET_PROPOSALS_PERIOD_APPROVED');
        default:
      }
      break;
    case routerView.TOKEN:
      return getQuery('GET_PROPOSALS_TOKEN', period);
    case routerView.DATE:
      return getQuery('GET_PROPOSALS_DATE', period);
    case routerView.ADDRESS:
      return getQuery('GET_PROPOSALS_ADDRESS', period);
    case routerView.SEARCH:
      return getQuery('GET_PROPOSALS_SEARCH');
    default:
  }
}

let apolloClient;

const httpLink = new HttpLink({
  uri: config.graph.moloch,
  credentials: "same-origin",
});

function createApolloClient() {
  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });
}

export function initializeApollo() {
  const _apolloClient = apolloClient ?? createApolloClient();
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export function useApollo() {
  let initialState;
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
}

export const MolochFeed = async (props) => {
  console.log('MolochFeed');
  const { address, first, skip, orderBy, orderDirection, proposalId, param } = props;
  const now = Math.floor(new Date().getTime() / 1000);

  let { dateBegin, dateEnd } = now.toString();
  if (props.view === routerView.DATE) {
    dateBegin = Math.floor(new Date(param).getTime() / 1000).toString();
    dateEnd = Math.floor((new Date(param).getTime() / 1000) + 86400).toString();
  }

  const client = initializeApollo()
  const res = await client.query({
    query: composeQuery(props.view, props.period),
    variables: { variables: { address, first, skip, orderBy, orderDirection, now, proposalId, param, dateBegin, dateEnd } },
  })

  return res;
};


MolochFeed.propTypes = {
  field: PropTypes.string,
  address: PropTypes.string,
  proposalId: PropTypes.string,
  first: PropTypes.number,
  skip: PropTypes.number,
  page: PropTypes.number,
  orderBy: PropTypes.string,
  orderDirection: PropTypes.string,
  view: PropTypes.string,
  period: PropTypes.string,
  format: PropTypes.string,
  param: PropTypes.string,
};
