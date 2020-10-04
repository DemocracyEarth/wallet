
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
  GET_PROPOSALS_TOKEN: gql`
    query addressProposals($param: String, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { tributeTokenSymbol: $param }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  GET_PROPOSALS_TOKEN_PAYMENT: gql`
    query addressProposals($param: String, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { paymentTokenSymbol: $param }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  GET_PROPOSALS_DATE: gql`
    query addressProposals($dateBegin: String, $dateEnd: String, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { createdAt_gte: $dateBegin, createdAt_lte: $dateEnd }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  GET_PROPOSALS_DAO: gql`
    query addressProposals($address: Bytes, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { molochAddress: $address }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  GET_PROPOSALS_PERIOD_QUEUE: gql`
    query addressProposals($now: Int, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { votingPeriodStarts_gte: $now }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  GET_PROPOSALS_PERIOD_VOTING: gql`
    query addressProposals($now: Int, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { votingPeriodStarts_lte: $now, votingPeriodEnds_gte: $now }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  GET_PROPOSALS_PERIOD_GRACE: gql`
    query addressProposals($now: Int, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { gracePeriodEnds_gt: $now, votingPeriodEnds_lt: $now }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  GET_PROPOSALS_PERIOD_READY: gql`
    query addressProposals($now: Int, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { gracePeriodEnds_lt: $now, processed: false, sponsored: true }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  GET_PROPOSALS_PERIOD_APPROVED: gql`
    query addressProposals($now: Int, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { processed: true, didPass: true }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  GET_PROPOSALS_PERIOD_REJECTED: gql`
    query addressProposals($now: Int, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { processed: true, didPass: false }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `,
  GET_PROPOSAL_ID: gql`
    query addressProposals($proposalId: String, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      proposals(where: { id: $proposalId }, first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
        ${PROPOSAL_DATA}
      }
    }
  `
};
