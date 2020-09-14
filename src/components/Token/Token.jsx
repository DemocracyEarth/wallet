import React from 'react';
import BigNumber from 'bignumber.js/bignumber';
import PropTypes from 'prop-types';

import 'styles/Dapp.css';

const numeral = require('numeral');

/**
* @summary renders a post in the timeline
*/
const Token = (props) => {
  const zeroes = (!props.decimals) ? 0 : Number(props.decimals);
  const balance = numeral(new BigNumber(props.quantity).dividedBy(Math.pow(10, zeroes)).toNumber()).format('0,0.[00]');

  return (
    <div className="token">
      <div className="token-ticker">
        {props.symbol}
      </div>
      <div className="token-balance">
        <div className="token-score">
          {balance}
        </div>
      </div>
    </div>
  );
};

Token.propTypes = {
  quantity: PropTypes.string,
  publicAddress: PropTypes.string,
  symbol: PropTypes.string,
  decimals: PropTypes.string,
};

export default Token;
