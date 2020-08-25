import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

import Menu from 'components/Menu/Menu';
import Timeline from 'components/Timeline/Timeline';
import Ledger from 'components/Ledger/Ledger';

import { view as routerView } from 'lib/const'

import 'styles/Dapp.css';

/**
* @summary displays the contents of a poll
*/
const Layout = (props) => {
  const { dao, address, period } = useParams();

  console.log(useParams());

  let view = routerView.HOME;
  let renderAddress = props.address;
  if (dao) { renderAddress = dao; view = routerView.DAO; }
  if (address) { renderAddress = address; view = routerView.ADDRESS; }
  if (period) { view = routerView.PERIOD; }

  return (
    <div>
      <div id="app" className="app">
        <div id="menu" className="left">
          <Menu address={renderAddress} view={view} />
        </div>
        <div id="content" className="right">
          <div id="main-feed" className="split split-left split-landing">
            <div id="proposals" className="content content-feed max100">
              <div id="non-editable-feed">
                <Timeline address={renderAddress} field={'memberAddress'} first={10} skip={0} orderBy={'createdAt'} orderDirection={'desc'}  />
              </div>
            </div>
          </div>
          <div id="alternative-feed" className="split split-right split-landing">
            <Ledger address={renderAddress} />
          </div>
        </div>
      </div>
    </div>
  );
};

Layout.propTypes = {
  addresss: PropTypes.string,
};

export default Layout;

