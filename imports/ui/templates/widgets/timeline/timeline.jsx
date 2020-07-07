import React, { Component } from 'react';
import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
import { ApolloProvider, Query } from 'react-apollo';

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/molochventures/moloch',
  cache: new InMemoryCache(),
});

const ProposalQuery = () => {
  return (
    <Query
      query={gql`
        {
          proposals(first: 5) {
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
      `}
    >
      {({ loading, error, data }) => {
        if (loading) return <p>Loading... </p>;
        if (error) return <p>Error!</p>;

        console.log(data);

        return data.proposals.map((proposal) => {
          return <p>{proposal.details}</p>;
        });
      }}
    </Query>
  );
};

export default class Timeline extends Component {
  componentDidMount() {
    console.log(this);
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <div className={`warning ${this.props}`}>
          <ProposalQuery />
        </div>
      </ApolloProvider>
    );
  }
}

/*
export default class Timeline extends React.Component {
  constructor(props) {
    super(props);

    _setTags();

    this.state = {
      subscription: Router.current().ready(),
      tags: _getTags(),
      suggestions: _getSuggestions(),
    };
    this.handleDelete = this.handleDelete.bind(this);
    this.handleAddition = this.handleAddition.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <div>
          <ProposalQuery />
        </div>
      </ApolloProvider>
    );
  }
}
*/
