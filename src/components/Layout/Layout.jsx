import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';

import Menu from 'components/Menu/Menu';
import Timeline from 'components/Timeline/Timeline';
import Ledger from 'components/Ledger/Ledger';

import 'styles/Dapp.css';

/**
* @summary displays the contents of a poll
*/
const Layout = (props) => {
  const { dao, address } = useParams();

  let renderAddress = props.address;
  if (dao) { renderAddress = dao; }
  if (address) { renderAddress = address; }

  return (
    <div>
      <div id="app" className="app">
        <div id="menu" className="left">
          <Menu address={renderAddress} />
        </div>
        <div id="content" className="right">
          <div id="main-feed" className="split split-left split-landing">
            <div id="proposals" className="content content-feed max100">
              <div id="non-editable-feed">
                <Timeline address={renderAddress} />
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
