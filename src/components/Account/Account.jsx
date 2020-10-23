import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
import { ApolloProvider, useLazyQuery } from '@apollo/react-hooks';
import { Link } from 'react-router-dom';

import { shortenCryptoName } from 'utils/strings';
import Search, { includeInSearch } from 'components/Search/Search';
import parser from 'html-react-parser';

import i18n from 'i18n';
import { config } from 'config'
import 'styles/Dapp.css';

const makeBlockie = require('ethereum-blockies-base64');

const client = new ApolloClient({
  uri: config.graph.ens,
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
    return data.domains[0].name;
  }
  return shortenCryptoName(publicAddress);
};

/**
* @summary renders a post in the timeline
*/
const AccountQuery = ({ publicAddress, width, height, format, hidden }) => {
  const [getAccount, { data, loading, error }] = useLazyQuery(ENS_ACCOUNT, { variables: { publicAddress } });
  let label;

  let isMounted = true;
  useEffect(() => {
    if (isMounted) {
      getAccount();
    }
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      isMounted = false;
    };
  }, []);

  const image = makeBlockie(publicAddress);
  const url = `/address/${publicAddress}`;
  const finalWidth = width || '24px';
  const finalHeight = height || '24px';

  if (publicAddress !== '0x0000000000000000000000000000000000000000') {
    if (loading) {
      if (format === 'searchBar') return null;
      return (
        <div className="identity">
          <div className="avatar-editor">
            <div className="identity-peer">
              <div className="option-placeholder identity-placeholder" />
            </div>
          </div>
        </div>
      );
    }
    if (error) return (
      <>
        {(format === 'searchBar') ?
          <Search />
          :
          <div className="empty failure">{parser(i18n.t('failure-short', { errorMessage: error }))}</div>
        }
      </>
    );

    if (data) {
      label = getENSName(data, publicAddress);
      includeInSearch(url, (data.domains.length > 0) ? data.domains[0].name : publicAddress, 'search-user');

      if (format === 'searchBar') {
        return <Search contextTag={{ id: publicAddress, text: i18n.t('search-user', { searchTerm: label }) }} />
      }
    }
  } else {
    label = '0x0';
  }

  if (hidden) {
    return label;
  }
  return (
    <div className="identity">
      <div className="avatar-editor">
        <img src={image} className={`symbol profile-pic ${(format === 'plainText') ? 'plain' : null}`} alt="" style={{ width: finalWidth, height: finalHeight }} />
        {(format === 'plainText') ?
          <Link to={url} title={publicAddress} onClick={(e) => { e.stopPropagation(); }}>
            {label}
          </Link>
          :
          <div className="identity-peer">
            <Link to={url} title={publicAddress} className="identity-label identity-label-micro" onClick={(e) => { e.stopPropagation(); }}>
              {label}
            </Link>
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
  hidden: PropTypes.bool,
};


/**
* @summary renders a post in the timeline
*/
const Account = (props) => {
  return (
    <ApolloProvider client={client}>
      <AccountQuery publicAddress={props.publicAddress} width={props.width} height={props.height} format={props.format} hidden={props.hidden} />
    </ApolloProvider>
  );
};

Account.propTypes = AccountQuery.propTypes;

export default Account;
