
import { gql } from 'apollo-boost';

const MENU_DATA = `
  id
  memberAddress
  moloch {
    id
    title
  }
  id
  didPass
  guildkick
  gracePeriodEnds
  votingPeriodStarts
  votingPeriodEnds
  sponsor
  processed
  applicant
`

export const query = {
   GET_MEMBERSHIPS: gql`
    query membershipDetails($address: String) {
      proposals(where: { proposer: $address }) {
        ${MENU_DATA}
      }
    }
  `,
  GET_TOKEN: gql`
    query membershipDetails($param: String) {
      proposals(where: { tributeTokenSymbol: $param }) {
        ${MENU_DATA}
      }
    }
  `,
  GET_DATE: gql`
    query membershipDetails($dateBegin: String, $dateEnd: String) {
      proposals(where: { createdAt_gte: $dateBegin, createdAt_lte: $dateEnd }) {
        ${MENU_DATA}
      }
    }
  `,
  GET_DAOS: gql`
    query membershipDetails($address: String) {
      proposals(where: { molochAddress: $address }) {
        ${MENU_DATA}
      }
    }
  `,

  GET_PROPOSAL_DAO: gql`
    query membershipDetails($proposalId: String) {
      proposals(where: { id: $proposalId }) {
        ${MENU_DATA}
      }
    }
  `,
};
