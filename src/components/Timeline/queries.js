
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
`
const VARIABLE_ADDRESS = `$address: Bytes,`;
const QUERY_MOLOCH_ADDRESS = `, molochAddress: $address`;
const QUERY_PROPOSER_ADDRESS = `, proposer: $address`;
const VARIABLE_TOKEN_SYMBOL = `$param: String`;
const QUERY_TOKEN_SYMBOL = `, tributeTokenSymbol: $param`;
const VARIABLE_DATE = `$dateBegin: String, $dateEnd: String`;
const QUERY_DATE_PARAM = `, createdAt_gte: $dateBegin, createdAt_lte: $dateEnd`;
const QUERY_TOKEN = `
  query addressProposals($param: String, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
    proposals(where: { tributeTokenSymbol: $param }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      ${PROPOSAL_DATA}
    }
  }
`;
const QUERY_DATE = `
  query addressProposals($dateBegin: String, $dateEnd: String, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
    proposals(where: { createdAt_gte: $dateBegin, createdAt_lte: $dateEnd }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      ${PROPOSAL_DATA}
    }
  }
`;
const QUERY_VOTING = `
  query addressProposals($now: Int, {{molochAddressDeclaration}} $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
    proposals(where: { votingPeriodStarts_lte: $now, votingPeriodEnds_gte: $now {{molochAddressQuery}} }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      ${PROPOSAL_DATA}
    }
  }
`;
const QUERY_APPROVED = `
  query addressProposals($now: Int, {{molochAddressDeclaration}} $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
    proposals(where: { processed: true, didPass: true {{molochAddressQuery}} }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      ${PROPOSAL_DATA}
    }
  }
`;
const QUERY_REJECTED = `
  query addressProposals($now: Int, {{molochAddressDeclaration}} $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
    proposals(where: { processed: true, didPass: false {{molochAddressQuery}} }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      ${PROPOSAL_DATA}
    }
  }
`
const QUERY_GRACE = `
  query addressProposals($now: Int, {{molochAddressDeclaration}} $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
    proposals(where: { gracePeriodEnds_gt: $now, votingPeriodEnds_lt: $now {{molochAddressQuery}} }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      ${PROPOSAL_DATA}
    }
  }
`
const QUERY_QUEUE = `
  query addressProposals($now: Int, {{molochAddressDeclaration}} $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
    proposals(where: { votingPeriodStarts_gte: $now {{molochAddressQuery}} }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      ${PROPOSAL_DATA}
    }
  }
`
const QUERY_READY = `
  query addressProposals($now: Int, {{molochAddressDeclaration}} $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
    proposals(where: { gracePeriodEnds_lt: $now, processed: false, sponsored: true {{molochAddressQuery}} }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      ${PROPOSAL_DATA}
    }
  }
`

export const query = {
  GET_PROPOSALS: gql`
    query addressProposals($first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  GET_PROPOSALS_MEMBER: gql`
    query addressProposals($address: Bytes, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { memberAddress: $address }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  GET_PROPOSALS_APPLICANT: gql`
    query addressProposals($address: Bytes, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { applicant: $address }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  GET_PROPOSALS_ADDRESS: gql`
    query addressProposals($address: Bytes, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { proposer: $address }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  GET_PROPOSALS_TOKEN: gql(QUERY_TOKEN),
  GET_PROPOSALS_TOKEN_PAYMENT: gql`
    query addressProposals($param: String, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { paymentTokenSymbol: $param }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  GET_PROPOSALS_DATE: gql(QUERY_DATE),
  GET_PROPOSALS_DAO: gql`
    query addressProposals($address: Bytes, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { molochAddress: $address }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  GET_PROPOSALS_PERIOD_QUEUE: gql(QUERY_QUEUE.replace('{{molochAddressDeclaration}}', '').replace('{{molochAddressQuery}}', '')),
  GET_PROPOSALS_PERIOD_VOTING: gql(QUERY_VOTING.replace('{{molochAddressDeclaration}}', '').replace('{{molochAddressQuery}}', '')),
  GET_PROPOSALS_PERIOD_GRACE: gql(QUERY_GRACE.replace('{{molochAddressDeclaration}}', '').replace('{{molochAddressQuery}}', '')),
  GET_PROPOSALS_PERIOD_READY: gql(QUERY_READY.replace('{{molochAddressDeclaration}}', '').replace('{{molochAddressQuery}}', '')),
  GET_PROPOSALS_PERIOD_APPROVED: gql(QUERY_APPROVED.replace('{{molochAddressDeclaration}}', '').replace('{{molochAddressQuery}}', '')),
  GET_PROPOSALS_PERIOD_REJECTED: gql(QUERY_REJECTED.replace('{{molochAddressDeclaration}}', '').replace('{{molochAddressQuery}}', '')),
  GET_PROPOSAL_ID: gql`
    query addressProposals($proposalId: String, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { id: $proposalId }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  GET_PROPOSALS_SEARCH: gql`
    query addressProposals($param: String, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { details_contains: $param }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
};

export const getQuery = (name, period) => {
  let finalQuery;
  let onVariableLine;
  let onQueryLine

  if (period) {
    if (name === 'GET_PROPOSALS_DAO') {
      onVariableLine = VARIABLE_ADDRESS;
      onQueryLine = QUERY_MOLOCH_ADDRESS;
    } else if (name === 'GET_PROPOSALS_ADDRESS') {
      onVariableLine = VARIABLE_ADDRESS;
      onQueryLine = QUERY_PROPOSER_ADDRESS;
    } else if (name === 'GET_PROPOSALS_TOKEN') {
      onVariableLine = VARIABLE_TOKEN_SYMBOL;
      onQueryLine = QUERY_TOKEN_SYMBOL;
    } else if (name === 'GET_PROPOSALS_DATE') {
      onVariableLine = VARIABLE_DATE;
      onQueryLine = QUERY_DATE_PARAM;
    }
    switch (period) {
      case 'approved':
        finalQuery = QUERY_APPROVED.replace('{{molochAddressDeclaration}}', onVariableLine).replace('{{molochAddressQuery}}', onQueryLine);
        break;
      case 'rejected':
        finalQuery = QUERY_REJECTED.replace('{{molochAddressDeclaration}}', onVariableLine).replace('{{molochAddressQuery}}', onQueryLine);
        break;
      case 'grace':
        finalQuery = QUERY_GRACE.replace('{{molochAddressDeclaration}}', onVariableLine).replace('{{molochAddressQuery}}', onQueryLine);
        break;
      case 'queue':
        finalQuery = QUERY_QUEUE.replace('{{molochAddressDeclaration}}', onVariableLine).replace('{{molochAddressQuery}}', onQueryLine);
        break;
      case 'voting':
        finalQuery = QUERY_VOTING.replace('{{molochAddressDeclaration}}', onVariableLine).replace('{{molochAddressQuery}}', onQueryLine);
        break;
      case 'ready':
        finalQuery = QUERY_READY.replace('{{molochAddressDeclaration}}', onVariableLine).replace('{{molochAddressQuery}}', onQueryLine);
        break;
      default:
    }
    return gql(finalQuery);
  }

  console.log(`name: ${name}`);
  return query[name];
}