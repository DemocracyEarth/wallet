import React from 'react';
import PropTypes from 'prop-types';
import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import { findLast } from 'lodash';

import { gui } from 'lib/const';
import { shortenCryptoName } from 'utils/strings';
import { includeInSearch } from 'components/Search/Search';

import { config } from 'config'
import 'styles/Dapp.css';

const client = new ApolloClient({
  uri: config.graph.moloch,
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
const DAOQuery = ({ publicAddress, width, height, format }) => {
  const { loading, error, data } = useQuery(gql(GET_DAO.replace('{{molochAddress}}', publicAddress)));

  const image = makeBlockie(publicAddress);
  const url = `/dao/${publicAddress}`;
  const finalWidth = width || '24px';
  const finalHeight = height || '24px';

  if (loading) {
    return (
      <div className="dao">
        <div className="avatar-editor">
          <img src={image} className="symbol dao-pic" alt="" style={{ width: finalWidth, height: finalHeight }} />
          <div className="identity-peer">
            <div className="option-placeholder identity-placeholder" />
          </div>
        </div>
      </div>
    );
  }
  if (error) return `Error! ${error}`;

  const daoTitle = findLast(data.moloches, { id: publicAddress }).title;
  let label;
  if (!daoTitle) {
    label = shortenCryptoName(publicAddress);
  } else {
    label = (daoTitle.length > gui.MAX_LENGTH_ACCOUNT_NAMES) ? `${daoTitle.slice(0, gui.MAX_LENGTH_ACCOUNT_NAMES)}...` : daoTitle;
  }

  includeInSearch(url, daoTitle, 'search-collective');

  return (
    <div className="dao">
      {(format === 'plainText') ?
        <div>
          <img src={image} className="symbol dao-pic" alt="" style={{ width: finalWidth, height: finalHeight }} />
          <div className="identity-peer">
            {label}
          </div>
        </div>
        :
        <div className="avatar-editor">
          <img src={image} className="symbol dao-pic" alt="" style={{ width: finalWidth, height: finalHeight }} />
          <div className="identity-peer">
            <a href={url} title={publicAddress} className="identity-label identity-label-micro">
              {label}
            </a>
          </div>
        </div>
      }
    </div>
  );
};

DAOQuery.propTypes = {
  publicAddress: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  format: PropTypes.string,
};


/**
* @summary renders a post in the timeline
*/
const DAO = (props) => {
  return (
    <ApolloProvider client={client}>
      <DAOQuery publicAddress={props.publicAddress} width={props.width} height={props.height} format={props.format} />
    </ApolloProvider>
  );
};

DAO.propTypes = DAOQuery.propTypes;

export default DAO;