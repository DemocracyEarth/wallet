
import { getQuery } from 'components/Timeline/makerQueries';
import { initializeApollo } from 'components/Timeline/apollo';
import { HttpLink } from 'apollo-boost';

import { calendar } from 'components/Timeline/apollo';
import { config } from 'config'
import { protocol } from 'lib/const';
import { translate } from 'components/Timeline/translator'

const httpLink = new HttpLink({
  uri: config.graph.maker,
  credentials: "same-origin",
});

/**
 * @summary retrieves the corresponding query for the timeline.
 */
const _composeQuery = (view, period, terms) => {
  switch (view) {
    default:
      return getQuery('GET_POLLS', period, terms);
  }
}

/**
* @summary changes the default names used in react to the ones required by the subgraph
*/
const _getTerms = (source) => {
  const sourceKeys = Object.keys(source);
  const target = [];

  for (const key of sourceKeys) {
    switch (key) {
      case 'orderDirection':
        target.push({ 
          source: key,
          target: (source[key] === 'asc') ? 'asc' : 'desc'
        });
        break;
      case 'orderBy':
        switch (source[key]) {
          case 'createdAt':
          default:
            target.push({
              source: key,
              target: 'startDate'
            });
        }
        break;
      default:
    }
  }
  return target;
}

const _dictionary = {
  modification: {
    id: 'id',
    startDate: 'votingPeriodStarts',
    pollId: 'proposalId',
    creator: 'proposer',
    endDate: 'votingPeriodEnds',
    url: 'details',
  },
  addition: {
    createdAt: 'timeLine[0].timestamp'
  }
}

export const makerFeed = async (props) => {
  const { address, first, skip, orderBy, orderDirection, proposalId, param } = props;
  const { now, dateBegin, dateEnd } = calendar(props, param);
  const terms = _getTerms(props);
  const client = initializeApollo(httpLink);
  const res = await client.query({
    query: _composeQuery(props.view, props.period, terms),
    variables: { address, first, skip, orderBy, orderDirection, now, id: proposalId, param, startDate: dateBegin, endDate: dateEnd },
  })
  
  return { 
    data: { 
      proposals: translate(res.data.polls, _dictionary),
      protocol: protocol.MAKER
    }, 
    loading: res.loading,
    error: res.error
  };
};
