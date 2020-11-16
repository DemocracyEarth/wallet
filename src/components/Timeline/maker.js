
import { getQuery } from 'components/Timeline/makerQueries';
import { initializeApollo } from 'components/Timeline/apollo';
import { HttpLink } from 'apollo-boost';

import { calendar } from 'components/Timeline/apollo';
import { config } from 'config'

const httpLink = new HttpLink({
  uri: config.graph.maker,
  credentials: "same-origin",
});

/**
 * @summary retrieves the corresponding query for the timeline.
 */
const composeQuery = (view, period, terms) => {
  switch (view) {
    default:
      return getQuery('GET_POLLS', period, terms);
  }
}

/**
* @summary translates the default names used in react to the ones required by the subgraph
*/
const translate = (source) => {
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

export const makerFeed = async (props) => {
  const { address, first, skip, orderBy, orderDirection, proposalId, param } = props;
  const { now, dateBegin, dateEnd } = calendar(props, param);
  const terms = translate(props);
  const client = initializeApollo(httpLink);
  const res = await client.query({
    query: composeQuery(props.view, props.period, terms),
    variables: { address, first, skip, orderBy, orderDirection, now, id: proposalId, param, startDate: dateBegin, endDate: dateEnd },
  })
  console.log(res);

  return res;
};
