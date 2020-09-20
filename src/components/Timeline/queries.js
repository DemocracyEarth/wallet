
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
  `
};
