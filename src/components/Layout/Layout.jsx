import React from 'react';
import PropTypes from 'prop-types';
import { useParams, useLocation } from 'react-router-dom';

import Menu from 'components/Menu/Menu';
import Timeline from 'components/Timeline/Timeline';
import Ledger from 'components/Ledger/Ledger';
import Burger from 'components/Menu/Burger';
import TabMenu, { showMain, showAlternative } from 'components/TabMenu/TabMenu';
import DocumentMeta from 'react-document-meta';

import i18n from 'i18n';
import { view as routerView } from 'lib/const';
import twitterCard from 'images/twitter-card.png';

import 'styles/Dapp.css';

/**
* @summary displays the contents of a poll
*/
const Layout = (props) => {
  const { dao, address, period, proposal, token, date, search } = useParams();
  const searchParams = new URLSearchParams(useLocation().search);

  // defaults
  let view = routerView.HOME;
  let renderAddress = props.address;
  let proposalId = '';
  let periodEpoch = '';
  let param = '';

  // context specific
  let description = i18n.t('meta-description');
  if (dao) {
    periodEpoch = searchParams.get('period');
    renderAddress = dao; 
    view = routerView.DAO;
    description = i18n.t('meta-dao', { address: dao });
  } else if (address) { 
    periodEpoch = searchParams.get('period');
    renderAddress = address;
    view = routerView.ADDRESS;
    description = i18n.t('meta-address', { address });
  } else if (period) { 
    periodEpoch = period;
    view = routerView.PERIOD;
    description = i18n.t('meta-period', { period }).charAt(0).toUpperCase() + i18n.t('meta-period', { period }).slice(1); ;
  } else if (proposal) {
    proposalId = proposal;
    view = routerView.PROPOSAL;
    description = i18n.t('meta-proposal', { proposal });
  } else if (token) {
    periodEpoch = searchParams.get('period');
    param = token.toUpperCase();
    view = routerView.TOKEN;
    description = i18n.t('meta-token', { token: token.toUpperCase() });
  } else if (date) {
    periodEpoch = searchParams.get('period');
    param = date;
    view = routerView.DATE;
    description = i18n.t('meta-date', { date });
  } else if (search) {
    param = search;
    view = routerView.SEARCH;
    description = i18n.t('meta-search', { search });
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
          <Menu address={renderAddress} view={view} proposalId={proposalId} param={param} />
        </div>
        <TabMenu tabs={
          [
            { key: 0, label: i18n.t('proposals'), action: showMain, selected: true },
            { key: 1, label: i18n.t('events'), action: showAlternative }
          ]}
        />
        <div id="content" className="right">
          <div id="main-feed" className="split split-left split-landing">
            <div id="proposals" className="content content-feed max100">
              <div id="non-editable-feed">
                <Timeline address={renderAddress} period={periodEpoch} view={view} proposalId={proposalId} param={param}
                  field={'memberAddress'} first={25} skip={0} page={1} orderBy={'createdAt'} orderDirection={'desc'} />
              </div>
            </div>
          </div>
          <div id="alternative-feed" className="split split-right split-landing">
            <Ledger address={renderAddress} view={view} proposalId={proposalId} first={25} skip={0}  />
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

