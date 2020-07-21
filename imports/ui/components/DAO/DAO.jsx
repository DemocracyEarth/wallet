import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';

import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { useQuery } from '@apollo/react-hooks';

import { shortenCryptoName } from '/imports/startup/both/modules/metamask';


const client = new ApolloClient({
  uri: Meteor.settings.public.graph.molochs,
  cache: new InMemoryCache(),
});

export const GET_DAO = `
{
  moloches(first: 1000) {
    id
    title
    version
  }
}
`;

const makeBlockie = require('ethereum-blockies-base64');

/**
* @summary renders a post in the timeline
*/
const DAOQuery = ({ publicAddress, width, height }) => {
  const { loading, error, data } = useQuery(gql(GET_DAO.replace('{{molochAddress}}', publicAddress)));

  if (loading) return null;
  if (error) return `Error! ${error}`;

  const image = makeBlockie(publicAddress);
  const url = `/dao/${publicAddress}`;

  const daoTitle = _.findWhere(data.moloches, { id: publicAddress }).title;
  let label;
  if (!daoTitle) {
    label = shortenCryptoName(publicAddress);
  } else {
    label = daoTitle;
  }
  const finalWidth = width || '24px';
  const finalHeight = height || '24px';

  return (
    <div className="dao">
      <div className="avatar-editor">
        <img src={image} className="symbol dao-pic" role="presentation" style={{ width: finalWidth, height: finalHeight }} />
        <div className="identity-peer">
          <a href={url} title={publicAddress} className="identity-label identity-label-micro">
            {label}
          </a>
        </div>
      </div>
    </div>
  );
};

DAOQuery.propTypes = {
  publicAddress: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
};


/**
* @summary renders a post in the timeline
*/
const DAO = (props) => {
  return (
    <ApolloProvider client={client}>
      <DAOQuery publicAddress={props.publicAddress} width={props.width} height={props.height} />
    </ApolloProvider>
  );
};

DAO.propTypes = DAOQuery.propTypes;

export default DAO;
