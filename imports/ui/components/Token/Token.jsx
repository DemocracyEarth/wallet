import { Meteor } from 'meteor/meteor';
import React from 'react';

import ApolloClient, { gql, InMemoryCache } from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { useQuery } from '@apollo/react-hooks';

import { BigNumber } from 'bignumber.js';
import PropTypes from 'prop-types';
import coinPalette from '/imports/ui/components/Token/palette.js';

const numeral = require('numeral');

const client = new ApolloClient({
  uri: Meteor.settings.public.graph.tokens,
  cache: new InMemoryCache(),
});

const GET_TOKEN = gql`
  query getTokens($pageSize: Int = 100) {
    tokens(first: $pageSize) {
      address
      name
      symbol
      decimals
    }
  }
`;

/**
* @summary assigns a color based on token address
* @param {string} publicAddress to search for token
* @return {string} with css value
*/
const _getColor = (publicAddress) => {
  const coin = _.findWhere(coinPalette, { publicAddress });
  if (coin) {
    return coin.color;
  }
  return 'auto';
};

/**
* @summary generates a readable number
* @param {string} value with quantity to format
* @param {object} token with settings from graph
* @param {number} decimals with after comma numerals
* @return {string} formatted number
*/
const _getRenderNumber = (value, token, decimals) => {
  let zeroes = decimals;
  if (!decimals) {
    zeroes = 0;
  }
  return numeral(new BigNumber(value).dividedBy(Math.pow(10, zeroes.toNumber())).toNumber()).format(token.format);
};

/**
* @summary graph query of token
* @param {string} publicAddress of the token contract
* @param {string} quantity with a big number
* @param {string} symbol with a ticker
* @param {string} decimal numbers this token takes
*/
const TokenQuery = ({ publicAddress, quantity, symbol, decimals }) => {
  const { loading, error, data } = useQuery(GET_TOKEN);

  if (loading) return null;
  if (error) return `Error! ${error}`;

  let token = _.findWhere(data.tokens, { symbol });
  if (!token) {
    token = _.findWhere(coinPalette, { symbol });
  }
  if (!token) {
    token = _.findWhere(coinPalette, { default: true });
  }

  const color = _getColor(publicAddress || token.publicAddress);
  const finalValue = _getRenderNumber(quantity, token, decimals);
  const borderColor = color;


  return (
    <div className="token">
      <div className="token-ticker" style={{ color, borderColor }}>
        {token.symbol}
      </div>
      <div className="token-balance" style={{ color, borderColor }}>
        <div className="token-score">
          {finalValue}
        </div>
      </div>
    </div>
  );
};

TokenQuery.propTypes = {
  quantity: PropTypes.string,
  publicAddress: PropTypes.string,
  symbol: PropTypes.string,
  decimals: PropTypes.string,
};

/**
* @summary renders a post in the timeline
*/
const Token = (props) => {
  return (
    <ApolloProvider client={client}>
      <TokenQuery publicAddress={props.publicAddress} quantity={props.quantity} symbol={props.symbol} decimals={props.decimals} />
    </ApolloProvider>
  );
};

Token.propTypes = TokenQuery.propTypes;

export default Token;
