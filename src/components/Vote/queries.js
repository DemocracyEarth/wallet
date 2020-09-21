
import { gql } from 'apollo-boost';

const VOTE_DATA = `
  id
  createdAt
  uintVote
  molochAddress
  memberAddress
  proposal {
    details
    id
  }
  member {
    shares
  }
`;

export const query = {
  GET_VOTES: gql`
    query addressVotes($first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      votes(first: $first, skip: $skip, orderBy:$orderBy, orderDirection:$orderDirection) {
        ${VOTE_DATA}
      }
    }
  `,
  GET_VOTES_FROM_ADDRESS: gql`
    query memberProposals($address: Bytes, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      votes(first: $first, skip: $skip, where: { memberAddress: $address } orderBy:$orderBy, orderDirection:$orderDirection) {
        ${VOTE_DATA}
      }
    }
  `,
  GET_VOTES_FROM_DAO: gql`
    query memberProposals($address: Bytes, $first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
      votes(first: $first, skip: $skip, where: { molochAddress: $address } orderBy:$orderBy, orderDirection:$orderDirection) {
        ${VOTE_DATA}
      }
    }
  `,
};
