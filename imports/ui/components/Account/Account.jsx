import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { TAPi18n } from 'meteor/tap:i18n';

import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { useQuery } from '@apollo/react-hooks';

import { shortenCryptoName } from '/imports/startup/both/modules/metamask';


const makeBlockie = require('ethereum-blockies-base64');

const client = new ApolloClient({
  uri: Meteor.settings.public.graph.ens,
  cache: new InMemoryCache(),
});


const ENS_ACCOUNT = `
{
  domains(where: { resolvedAddress: "{{ensAddress}}" }) {
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
    return data.domains[0].name;
  }
  return shortenCryptoName(publicAddress);
};

/**
* @summary renders a post in the timeline
*/
const AccountQuery = ({ publicAddress, width, height }) => {
  let label;
  if (publicAddress !== '0x0000000000000000000000000000000000000000') {
    const { loading, error, data } = useQuery(gql(ENS_ACCOUNT.replace('{{ensAddress}}', publicAddress)));

    if (loading) return null;
    if (error) return `Error! ${error}`;

    label = getENSName(data, publicAddress);
  } else {
    label = '0x0';
  }

  const image = makeBlockie(publicAddress);
  const url = `/address/${publicAddress}`;
  const finalWidth = width || '24px';
  const finalHeight = height || '24px';

  return (
    <div className="identity">
      <div className="avatar-editor">
        <img src={image} className="symbol profile-pic" role="presentation" style={{ width: finalWidth, height: finalHeight }} />
        <div className="identity-peer">
          <a href={url} title={publicAddress} className="identity-label identity-label-micro">
            {label}
          </a>
        </div>
      </div>
    </div>
  );
};

AccountQuery.propTypes = {
  publicAddress: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
};

/**
* @summary renders a post in the timeline
*/
const Account = (props) => {
  return (
    <ApolloProvider client={client}>
      <AccountQuery publicAddress={props.publicAddress} width={props.width} height={props.height} />
    </ApolloProvider>
  );
};

Account.propTypes = AccountQuery.propTypes;

export default Account;
