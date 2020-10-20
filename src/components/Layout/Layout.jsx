import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

import Menu from 'components/Menu/Menu';
import Timeline from 'components/Timeline/Timeline';
import Ledger from 'components/Ledger/Ledger';
import Burger from 'components/Menu/Burger';
import TabMenu, { showMain, showAlternative } from 'components/TabMenu/TabMenu';

import i18n from 'i18n';
import { view as routerView } from 'lib/const'

import 'styles/Dapp.css';

/**
* @summary displays the contents of a poll
*/
const Layout = (props) => {
  const { dao, address, period, proposal, token, date, search } = useParams();

  // defaults
  let view = routerView.HOME;
  let renderAddress = props.address;
  let proposalId = '';
  let periodEpoch = '';
  let param = '';

  // context specific
  if (dao) {
    renderAddress = dao; 
    view = routerView.DAO;
  } else if (address) { 
  renderAddress = address;
    view = routerView.ADDRESS; 
  } else if (period) { 
    periodEpoch = period;
    view = routerView.PERIOD;
  } else if (proposal) {
    proposalId = proposal;
    view = routerView.PROPOSAL;
  } else if (token) {
    param = token.toUpperCase();
    view = routerView.TOKEN;
  } else if (date) {
    param = date;
    view = routerView.DATE;
  } else if (search) {
    param = search;
    view = routerView.SEARCH;
  }

  console.log(param);
  console.log(view);

  if (props.mobileMenu) {
    return (
      <Burger address={renderAddress} view={view} proposalId={proposalId} param={param} />
    )
  }

  return (
    <>
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
                  field={'memberAddress'} first={25} skip={0} page={1} orderBy={'createdAt'} orderDirection={'desc'}  />
              </div>
            </div>
          </div>
          <div id="alternative-feed" className="split split-right split-landing">
            <Ledger address={renderAddress} view={view} proposalId={proposalId} first={25} skip={0}  />
          </div>
        </div>
      </div>
    </>
  );
};

Layout.propTypes = {
  addresss: PropTypes.string,
  mobileMenu: PropTypes.bool,
};

export default Layout;

