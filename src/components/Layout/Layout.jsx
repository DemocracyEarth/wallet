import React from 'react';
import PropTypes from 'prop-types';
import 'styles/Dapp.css';
import { useParams } from 'react-router-dom';

import Menu from 'components/Menu/Menu';
import Timeline from 'components/Timeline/Timeline';
import Ledger from 'components/Ledger/Ledger';

/**
* @summary displays the contents of a poll
*/
const Layout = (props) => {
  console.log(useParams());
  return (
    <div>
      <div id="app" className="app">
        <div id="menu" className="left">
          <Menu address={props.address} />
        </div>
        <div id="content" className="right">
          <div id="main-feed" className="split split-left split-landing">
            <div id="proposals" className="content content-feed max100">
              <div id="non-editable-feed">
                <Timeline address={props.address} />
              </div>
            </div>
          </div>
          <div id="alternative-feed" className="split split-right split-landing">
            <Ledger />
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
