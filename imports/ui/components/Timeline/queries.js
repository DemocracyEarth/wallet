import { gql } from 'apollo-boost';

export const MOLOCH_DAO = gql`
{
  proposals(first: 25) {
    id
    timestamp
    proposalIndex
    startingPeriod
    member {
      id
    }
    memberAddress
    applicant {
      applicantAddress
    }
    tokenTribute
    sharesRequested
    yesVotes
    noVotes
    yesShares
    noShares
    details
    processed
    status
    votingPeriodBegins
    votingPeriodEnds
    gracePeriodEnds
  }
}
`;

export const MOLOCHS = gql`
{
  proposals(first: 20, orderBy:createdAt, orderDirection:desc) {
    id
    proposalId
    createdAt
    proposalIndex
    startingPeriod
    moloch {
      id
    }
    memberAddress
    applicant
    tributeToken
    tributeTokenSymbol
    tributeTokenDecimals
    sharesRequested
    yesVotes
    noVotes
    yesShares
    noShares
    details
    processed
    votingPeriodStarts
    votingPeriodEnds
    gracePeriodEnds
  }
}
`;

