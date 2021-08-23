import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import Ledger from 'components/Ledger/Ledger';
import List from 'components/List/List';
import Burger from 'components/Menu/Burger';
import Vault from 'components/Vault/Vault';
import TabMenu, { showMain, showAlternative } from 'components/TabMenu/TabMenu';
import DocumentMeta from 'react-document-meta';
import { daiPriceABI, daiPriceOracle, daiAddress } from 'components/Vault/chainlink-daiprice-abi.js';
import { wethPriceABI, wethPriceOracle, wethAddress } from 'components/Vault/chainlink-wethprice-abi.js';
import { ubidaiABI } from 'components/Vault/ubidai-abi.js';
import { ubiwethABI } from 'components/Vault/ubiweth-abi.js';
import { find } from 'lodash';
import i18n from 'i18n';
import { view as routerView } from 'lib/const';
import twitterCard from 'images/twitter-meta.png';

import 'styles/Dapp.css';

const vaultList = [
  {
    path: 'ubi-dai',
    address: '0xdf5110ef6bc751cbaf76d35b8a3f312b581b5173',
    strategy: '0x137f79e5a16BcF14d6a54d1d4CEdB00B8CE65838',
    deprecated: '0xE721D77FB3D680de95aF510D79c24E839308352B',
    title: i18n.t('ubi-dai-title'),
    description: i18n.t('ubi-dai-description'),
    link: '',
    vaultTicker: i18n.t('ticker-ubidai'),
    vaultABI: ubidaiABI,
    token: daiAddress,
    symbol: 'DAI',
    oracle: daiPriceOracle,
    oracleABI: daiPriceABI,
    fiat: 'USD',
    decimals: '18',
    fiatDecimals: '8'
  },
  {
    path: 'ubi-weth',
    address: '0x2147935d9739da4e691b8ae2e1437492a394ebf5',
    strategy: '0x674cbf69d8680b183122de955F937eF287bAf218',
    deprecated: '',
    title: i18n.t('ubi-weth-title'),
    description: i18n.t('ubi-weth-description'),
    link: '',
    vaultTicker: i18n.t('ticker-ubiweth'),
    token: wethAddress,
    symbol: 'WETH',
    oracle: wethPriceOracle,
    oracleABI: wethPriceABI,
    fiat: 'USD',
    decimals: '18',
    fiatDecimals: '8',
    vaultABI: ubiwethABI,
  },
];

/**
* @summary displays the contents of a poll
*/
const Layout = (props) => {
  const { dao, address, period, proposal, token, date, search, vault } = useParams();
  // const searchParams = new URLSearchParams(useLocation().search);

  // defaults
  let view = routerView.HOME;
  let renderAddress = props.address;
  let proposalId = '';
  let param = '';

  // context specific
  let description = i18n.t('meta-description');
  let vaultData;

  if (dao) {
    // periodEpoch = searchParams.get('period');
    renderAddress = dao; 
    view = routerView.DAO;
    description = i18n.t('meta-dao', { address: dao });
  } else if (address) { 
    // periodEpoch = searchParams.get('period');
    renderAddress = address;
    view = routerView.ADDRESS;
    description = i18n.t('meta-address', { address });
  } else if (period) { 
    // periodEpoch = period;
    view = routerView.PERIOD;
    description = i18n.t('meta-period', { period }).charAt(0).toUpperCase() + i18n.t('meta-period', { period }).slice(1); ;
  } else if (proposal) {
    proposalId = proposal;
    view = routerView.PROPOSAL;
    description = i18n.t('meta-proposal', { proposal });
  } else if (token) {
    // periodEpoch = searchParams.get('period');
    param = token.toUpperCase();
    view = routerView.TOKEN;
    description = i18n.t('meta-token', { token: token.toUpperCase() });
  } else if (date) {
    // periodEpoch = searchParams.get('period');
    param = date;
    view = routerView.DATE;
    description = i18n.t('meta-date', { date });
  } else if (search) {
    param = search;
    view = routerView.SEARCH;
    description = i18n.t('meta-search', { search });
  } else if (vault) {
    vaultData = find(vaultList, { path: vault });
  } else {
    vaultData = vaultList[1];
  }

  const meta = {
    title: i18n.t('meta-title'),
    description,
    canonical: window.location.href,
    meta: {
      charset: 'utf-8',
      name: {
        keywords: i18n.t('meta-keywords')
      },
      property: {
        'og:title': i18n.t('meta-title'),
        'og:type': 'article',
        'og:image': twitterCard,
        'og:site_name': i18n.t('meta-title'),
        'twitter:site': i18n.t('meta-title'),
        'twitter:title': i18n.t('meta-description')
      }
    }
  };

  if (props.mobileMenu) {
    return (
      <Burger address={renderAddress} view={view} proposalId={proposalId} param={param} />
    )
  }

  return (
    <DocumentMeta {...meta}>
      <div id="app" className="app">
        <div id="menu" className="left">
          {/*<Menu address={renderAddress} view={view} proposalId={proposalId} param={param} /> */}
          <List />
        </div>
        <TabMenu tabs={
          [
            { key: 0, label: i18n.t('activity'), action: showMain, selected: true },
            { key: 1, label: i18n.t('events'), action: showAlternative }
          ]}
        />
        <div id="content" className="right">
          <div id="main-feed" className="split split-left split-landing">
            <div id="proposals" className="content content-feed max100">
              <div id="non-editable-feed">
                {/*<Timeline address={renderAddress} period={periodEpoch} view={view} proposalId={proposalId} param={param}
                  field={'memberAddress'} first={25} skip={0} page={1} orderBy={'createdAt'} orderDirection={'desc'} />*/}
                <Vault
                  vaultTicker={vaultData.vaultTicker}
                  vaultABI={vaultData.vaultABI}
                  account={props.address} 
                  address={vaultData.address}
                  strategy={vaultData.strategy}
                  deprecated={vaultData.deprecated}
                  title={vaultData.title}
                  description={vaultData.description}
                  link={vaultData.link}
                  token={vaultData.token}
                  symbol={vaultData.symbol}
                  decimals={vaultData.decimals}
                  oracle={vaultData.oracle}
                  oracleABI={vaultData.oracleABI}
                  fiat={vaultData.fiat}
                  fiatDecimals={vaultData.fiatDecimals}
                />
              </div>
            </div>
          </div>
          <div id="alternative-feed" className="split split-right split-landing">
            <Ledger 
              address={vaultData.address}
              symbol={vaultData.symbol}
              view={view} 
              proposalId={proposalId} 
              first={25} 
              skip={0}
            />
          </div>
        </div>
      </div>
    </DocumentMeta>
  );
};

Layout.propTypes = {
  addresss: PropTypes.string,
  mobileMenu: PropTypes.bool,
};

export default Layout;

