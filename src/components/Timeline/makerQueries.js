
import { gql } from 'apollo-boost';
import { translate } from 'components/Timeline/apollo';

const PROPOSAL_DATA = `
  id
  creator
  blockCreated
  pollId
  startDate
  endDate
  multiHash
  url
  withdrawn
  votesCount
  votes {
    id
    voter
    option
    block
    transactionHash
    timestamp
  }
  timeLineCount
  timeLine {
    id
    block
    transactionHash
    timestamp
  }
`;
const PROPOSAL_ORDER = `$first: Int, $skip: Int`;
const PROPOSAL_SORT = `first: $first, skip: $skip, orderBy: {{orderBy}}, orderDirection: {{orderDirection}}`;

const expression = {
  QUERY_POLLS : `
    query makerPolls(${PROPOSAL_ORDER}) {
      polls(${PROPOSAL_SORT}) {
        ${PROPOSAL_DATA}
      }
    }
  `,
}

const query = {
  GET_POLLS: expression.QUERY_POLLS,
};

export const getQuery = (name, period, terms) => {
  const res = query[name];
  const final = translate(res, terms);

  return gql(final);
}
