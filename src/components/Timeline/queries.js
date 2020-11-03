
import { gql } from 'apollo-boost';

const PROPOSAL_DATA = `
  id
  createdAt
  proposalIndex
  proposalId
  moloch {
    id
  }
  molochAddress
  memberAddress
  delegateKey
  applicant
  proposer
  sponsor
  sharesRequested
  lootRequested
  tributeOffered
  tributeToken
  tributeTokenSymbol
  tributeTokenDecimals
  paymentRequested
  paymentToken
  paymentTokenSymbol
  paymentTokenDecimals
  startingPeriod
  yesVotes
  noVotes
  sponsored
  sponsoredAt
  processed
  didPass
  cancelled
  aborted
  whitelist
  guildkick
  newMember
  trade
  details
  maxTotalSharesAndLootAtYesVote
  votes {
    uintVote
    id
    member {
      id
      memberAddress
    }
  }
  yesShares
  noShares
  votingPeriodStarts
  votingPeriodEnds
  gracePeriodEnds
  molochVersion
`;
const PROPOSAL_ORDER = `$first: Int, $skip: Int, $orderBy: String, $orderDirection: String`;
const PROPOSAL_SORT = `first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection`;

const expression = {
  VARIABLE_ADDRESS : `$address: Bytes,`,
  QUERY_MOLOCH_ADDRESS : `, molochAddress: $address`,
  QUERY_PROPOSER_ADDRESS : `, proposer: $address`,
  VARIABLE_TOKEN_SYMBOL : `$param: String`,
  QUERY_TOKEN_SYMBOL : `, tributeTokenSymbol: $param`,
  VARIABLE_DATE : `$dateBegin: String, $dateEnd: String`,
  QUERY_DATE_PARAM : `, createdAt_gte: $dateBegin, createdAt_lte: $dateEnd`,
  QUERY_TOKEN : `
    query addressProposals($param: String, ${PROPOSAL_ORDER}) {
      proposals(where: { tributeTokenSymbol: $param }, ${PROPOSAL_SORT}) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  QUERY_DATE : `
    query addressProposals($dateBegin: String, $dateEnd: String, ${PROPOSAL_ORDER}) {
      proposals(where: { createdAt_gte: $dateBegin, createdAt_lte: $dateEnd }, ${PROPOSAL_SORT}) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  QUERY_VOTING : `
    query addressProposals($now: Int, {{molochAddressDeclaration}} ${PROPOSAL_ORDER}) {
      proposals(where: { votingPeriodStarts_lte: $now, votingPeriodEnds_gte: $now {{molochAddressQuery}} }, ${PROPOSAL_SORT}) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  QUERY_APPROVED : `
    query addressProposals($now: Int, {{molochAddressDeclaration}} ${PROPOSAL_ORDER}) {
      proposals(where: { processed: true, didPass: true {{molochAddressQuery}} }, ${PROPOSAL_SORT}) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  QUERY_REJECTED : `
    query addressProposals($now: Int, {{molochAddressDeclaration}} ${PROPOSAL_ORDER}) {
      proposals(where: { processed: true, didPass: false {{molochAddressQuery}} }, ${PROPOSAL_SORT}) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  QUERY_GRACE : `
    query addressProposals($now: Int, {{molochAddressDeclaration}} ${PROPOSAL_ORDER}) {
      proposals(where: { gracePeriodEnds_gt: $now, votingPeriodEnds_lt: $now {{molochAddressQuery}} }, ${PROPOSAL_SORT}) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  QUERY_QUEUE : `
    query addressProposals($now: Int, {{molochAddressDeclaration}} ${PROPOSAL_ORDER}) {
      proposals(where: { votingPeriodStarts_gte: $now {{molochAddressQuery}} }, ${PROPOSAL_SORT}) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  QUERY_READY : `
    query addressProposals($now: Int, {{molochAddressDeclaration}} ${PROPOSAL_ORDER}) {
      proposals(where: { gracePeriodEnds_lt: $now, processed: false, sponsored: true {{molochAddressQuery}} }, ${PROPOSAL_SORT}) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  QUERY_PROPOSAL_ID : `
    query addressProposals($proposalId: String, ${PROPOSAL_ORDER}) {
      proposals(where: { id: $proposalId }, ${PROPOSAL_SORT}) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  QUERY_PROPOSALS_SEARCH : `
    query addressProposals($param: String, ${PROPOSAL_ORDER}) {
      proposals(where: { details_contains: $param }, ${PROPOSAL_SORT}) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  QUERY_DAO : `
    query addressProposals($address: Bytes, ${PROPOSAL_ORDER}) {
      proposals(where: { molochAddress: $address }, ${PROPOSAL_SORT}) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  QUERY_TOKEN_PAYMENT : `
    query addressProposals($param: String, ${PROPOSAL_ORDER}) {
      proposals(where: { paymentTokenSymbol: $param }, ${PROPOSAL_SORT}) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  QUERY_PROPOSALS_ADDRESS : `
    query addressProposals($address: Bytes, ${PROPOSAL_ORDER}) {
      proposals(where: { proposer: $address }, ${PROPOSAL_SORT}) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  QUERY_PROPOSALS : `
    query addressProposals(${PROPOSAL_ORDER}) {
      proposals(${PROPOSAL_SORT}) {
        ${PROPOSAL_DATA}
      }
    }
  `,
}

const query = {
  GET_PROPOSALS: gql(expression.QUERY_PROPOSALS),
  GET_PROPOSALS_ADDRESS: gql(expression.QUERY_PROPOSALS_ADDRESS),
  GET_PROPOSALS_TOKEN: gql(expression.QUERY_TOKEN),
  GET_PROPOSALS_TOKEN_PAYMENT: gql(expression.QUERY_TOKEN_PAYMENT),
  GET_PROPOSALS_DATE: gql(expression.QUERY_DATE),
  GET_PROPOSALS_DAO: gql(expression.QUERY_DAO),
  GET_PROPOSAL_ID: gql(expression.QUERY_PROPOSAL_ID),
  GET_PROPOSALS_SEARCH: gql(expression.QUERY_PROPOSALS_SEARCH),
  GET_PROPOSALS_PERIOD_QUEUE: gql(expression.QUERY_QUEUE.replace('{{molochAddressDeclaration}}', '').replace('{{molochAddressQuery}}', '')),
  GET_PROPOSALS_PERIOD_VOTING: gql(expression.QUERY_VOTING.replace('{{molochAddressDeclaration}}', '').replace('{{molochAddressQuery}}', '')),
  GET_PROPOSALS_PERIOD_GRACE: gql(expression.QUERY_GRACE.replace('{{molochAddressDeclaration}}', '').replace('{{molochAddressQuery}}', '')),
  GET_PROPOSALS_PERIOD_READY: gql(expression.QUERY_READY.replace('{{molochAddressDeclaration}}', '').replace('{{molochAddressQuery}}', '')),
  GET_PROPOSALS_PERIOD_APPROVED: gql(expression.QUERY_APPROVED.replace('{{molochAddressDeclaration}}', '').replace('{{molochAddressQuery}}', '')),
  GET_PROPOSALS_PERIOD_REJECTED: gql(expression.QUERY_REJECTED.replace('{{molochAddressDeclaration}}', '').replace('{{molochAddressQuery}}', '')),
};

export const getQuery = (name, period) => {
  if (period) {
    let onVariableLine;
    let onQueryLine;
    if (name === 'GET_PROPOSALS_DAO') {
      onVariableLine = expression.VARIABLE_ADDRESS;
      onQueryLine = expression.QUERY_MOLOCH_ADDRESS;
    } else if (name === 'GET_PROPOSALS_ADDRESS') {
      onVariableLine = expression.VARIABLE_ADDRESS;
      onQueryLine = expression.QUERY_PROPOSER_ADDRESS;
    } else if (name === 'GET_PROPOSALS_TOKEN') {
      onVariableLine = expression.VARIABLE_TOKEN_SYMBOL;
      onQueryLine = expression.QUERY_TOKEN_SYMBOL;
    } else if (name === 'GET_PROPOSALS_DATE') {
      onVariableLine = expression.VARIABLE_DATE;
      onQueryLine = expression.QUERY_DATE_PARAM;
    }
    const finalQuery = expression[`QUERY_${period.toUpperCase()}`].replace('{{molochAddressDeclaration}}', onVariableLine).replace('{{molochAddressQuery}}', onQueryLine);
    return gql(finalQuery);
  }

  return query[name];
}