import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';

import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { useQuery } from '@apollo/react-hooks';
import { gui } from '/lib/const';

import { shortenCryptoName } from '/imports/startup/both/modules/metamask';
import { includeInSearch } from '/imports/ui/components/Search/Search.jsx';

const makeBlockie = require('ethereum-blockies-base64');

const client = new ApolloClient({
  uri: Meteor.settings.public.graph.ens,
  cache: new InMemoryCache(),
});


const ENS_ACCOUNT = gql`
  query addressDetails($publicAddress: String) {
    domains(where: { resolvedAddress: $publicAddress }) {
      id
      name
      labelName
      labelhash
      resolvedAddress {
        id
      }
    }
  }
`;

/**
* @summary writes name based on ENS settings
* @param {object} data obtained from graph protocol
* @param {string} publicAddress to parse
*/
const getENSName = (data, publicAddress) => {
  if (data.domains.length > 0) {
    return (data.domains[0].name.length > gui.MAX_LENGTH_ACCOUNT_NAMES) ? `${data.domains[0].name.slice(0, gui.MAX_LENGTH_ACCOUNT_NAMES)}...` : data.domains[0].name;
  }
  return shortenCryptoName(publicAddress);
};

/**
* @summary renders a post in the timeline
*/
const AccountQuery = ({ publicAddress, width, height, format }) => {
  let label;

  const image = makeBlockie(publicAddress);
  const url = `/address/${publicAddress}`;
  const finalWidth = width || '24px';
  const finalHeight = height || '24px';

  if (publicAddress !== '0x0000000000000000000000000000000000000000') {
    const { loading, error, data } = useQuery(ENS_ACCOUNT, { variables: { publicAddress } });

    if (loading) {
      return (
        <div className="identity">
          <div className="avatar-editor">
            <img src={image} className="symbol profile-pic" role="presentation" style={{ width: finalWidth, height: finalHeight }} />
            <div className="identity-peer">
              <div className="option-placeholder identity-placeholder" />
            </div>
          </div>
        </div>
      );
    }
    if (error) return `Error! ${error}`;

    label = getENSName(data, publicAddress);
    includeInSearch(url, (data.domains.length > 0) ? data.domains[0].name : publicAddress, 'search-user');
  } else {
    label = '0x0';
  }

  return (
    <div className="identity">
      <div className="avatar-editor">
        <img src={image} className={`symbol profile-pic ${(format === 'plainText') ? 'plain' : null}`} role="presentation" style={{ width: finalWidth, height: finalHeight }} />
        {(format === 'plainText') ?
          <a href={url} title={publicAddress}>
            {label}
          </a>
          :
          <div className="identity-peer">
            <a href={url} title={publicAddress} className="identity-label identity-label-micro">
              {label}
            </a>
          </div>
        }
      </div>
    </div>
  );
};

AccountQuery.propTypes = {
  publicAddress: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  format: PropTypes.string,
};

/**
* @summary renders a post in the timeline
*/
const Account = (props) => {
  return (
    <ApolloProvider client={client}>
      <AccountQuery publicAddress={props.publicAddress} width={props.width} height={props.height} format={props.format} />
    </ApolloProvider>
  );
};

Account.propTypes = AccountQuery.propTypes;

export default Account;
