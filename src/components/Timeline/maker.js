
import { getQuery } from 'components/Timeline/makerQueries';
import { initializeApollo } from 'components/Timeline/apollo';
import { HttpLink } from 'apollo-boost';

import { view as routerView, period as routerPeriod } from 'lib/const';
import { config } from 'config'
import { onError } from "apollo-link-error";

const httpLink = new HttpLink({
  uri: config.graph.maker,
  credentials: "same-origin",
});

const errorLink = onError(error => {
  const { graphQLErrors = [], networkError = {}, operation = {}, forward } =
    error || {};
  const { getContext } = operation || {};
  const { scope, headers = {} } = getContext() || {};
  const { message: networkErrorMessage = '' } = networkError || {};
  const networkFailed = message =>
    typeof message === 'string' &&
    message.startsWith('NetworkError when attempting to fetch resource');

  if (networkFailed(networkErrorMessage)) return forward(operation);
});

const link = errorLink.concat(httpLink);

/**
 * @summary retrieves the corresponding query for the timeline.
 * @param {string} field if required for a specific query
 */
const composeQuery = (view, period) => {
  return getQuery('GET_POLLS');
  /*
  switch (view) {
    case routerView.HOME:
      return getQuery('GET_PROPOSALS');
    case routerView.DAO:
      return getQuery('GET_PROPOSALS_DAO', period);
    case routerView.PROPOSAL:
      return getQuery('GET_PROPOSAL_ID');
    case routerView.PERIOD:
      return getQuery('GET_PROPOSALS_TOKEN', period);
    case routerView.DATE:
      return getQuery('GET_PROPOSALS_DATE', period);
    case routerView.ADDRESS:
      return getQuery('GET_PROPOSALS_ADDRESS', period);
    case routerView.SEARCH:
      return getQuery('GET_PROPOSALS_SEARCH');
    default:
  }
  */
}

export const makerFeed = async (props) => {
  const { address, first, skip, orderBy, orderDirection, proposalId, param } = props;

  console.log(`config.graph.maker: ${config.graph.maker}`);
  console.log(props);
  
  // transpile
  let final_orderBy;
  switch (orderBy) {
    case 'createdAt':
    default:
      final_orderBy = 'startDate'
  }

  const now = Math.floor(new Date().getTime() / 1000);
  let { dateBegin, dateEnd } = now.toString();
  if (props.view === routerView.DATE) {
    dateBegin = Math.floor(new Date(param).getTime() / 1000).toString();
    dateEnd = Math.floor((new Date(param).getTime() / 1000) + 86400).toString();
  }

  const client = initializeApollo(link);
  const res = await client.query({
    query: composeQuery(props.view, props.period)
  })
  console.log(res);

  return res;
};
