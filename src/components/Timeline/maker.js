
import { getQuery } from 'components/Timeline/makerQueries';
import { initializeApollo } from 'components/Timeline/apollo';
import { HttpLink } from 'apollo-boost';

import { calendar } from 'components/Timeline/apollo';
import { config } from 'config'
import { protocol } from 'lib/const';

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
    createdAt: 'startDate'
  }
}

const _hasKeyword = (keyword) => {

  const modificationKeys = Object.keys(_dictionary.modification);
  const additionValues = Object.values(_dictionary.addition);
  
  if (modificationKeys.includes(keyword)) {
    console.log(`modificationkeys has.. ${keyword}`)
    return 'MOD'
  }
  if (additionValues.includes(keyword)) {
    console.log(`additionValues has.. ${keyword}`)
    return 'ADD'
  }
  return false;
}

/**
* @summary changes the data set to something that the user interface will understand
*/
const _translate = (data) => {
  const finalRes = [];
  let newPoll = {};
  let finalPoll = {};
  let pollKeys;
  let section;
  for (const poll of data.polls) {
    newPoll = {};
    pollKeys = Object.keys(poll);
    console.log(pollKeys);

    for (const keyword of pollKeys) {
      section = _hasKeyword(keyword, poll);
      if (section === 'MOD') {
        newPoll[_dictionary.modification[keyword]] = poll[keyword]
        console.log(JSON.stringify(newPoll));
      }
    }
    finalPoll = {...poll, ...newPoll};
    console.log(`finalPoll`);
    console.log(finalPoll)

    finalRes.push(finalPoll);

  }

  console.log(`finalRes:`);
  console.log(finalRes);
  return finalRes;
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
  console.log(res);
  console.log(_translate(res.data));

  return { 
    data: { 
      proposals: _translate(res.data),
      protocol: protocol.MAKER
    }, 
    loading: res.loading,
    error: res.error
  };
};
