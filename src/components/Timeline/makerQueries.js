
import { gql } from 'apollo-boost';

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
const PROPOSAL_ORDER = `$first: Int, $skip: Int, $orderBy: String, $orderDirection: String`;
const PROPOSAL_SORT = `first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection`;

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
  GET_POLLS: gql(expression.QUERY_POLLS),
};

export const getQuery = (name, period) => {
  if (period) {
    
  }

  console.log(expression.QUERY_POLLS);
  console.log(query[name]);

  return query[name];
}