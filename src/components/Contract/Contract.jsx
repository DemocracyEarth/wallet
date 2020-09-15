import React from 'react';
import PropTypes from 'prop-types';

import i18n from 'i18n';
import conditions from 'images/conditions.svg';
import 'styles/Dapp.css';


/**
* @summary displays the contents of a poll
*/
const Contract = (props) => {
  return (
    <div>
      <div className="countdown">
        <div className="countdown-label countdown-label">
          <img className="url-icon icon-up2" alt="" src={conditions} /> {i18n.t('moloch-proposal-conditions')}
        </div>
      </div>
      <div className="countdown-timer-bar" style={{ width: '100%' }}>
      </div>
      <div className="smart-contract">
        {props.children}
      </div>
    </div>
  );
};

Contract.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

export default Contract;
