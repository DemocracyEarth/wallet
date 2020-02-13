import { Meteor } from 'meteor/meteor';
import Web3 from 'web3';
import abi from 'human-standard-token-abi';
import { BigNumber } from 'bignumber.js';
import { Session } from 'meteor/session';

import { token } from '/lib/token';

const Fortmatic = require('fortmatic');
const numeral = require('numeral');

/**
* @summary setups a wallet either via plugin or iframe
*/
const _setupWallet = () => {
  if (Meteor.isClient) {
    if (typeof window.web3 !== 'undefined') {
      return new Web3(window.web3.currentProvider);
    }
    const fm = new Fortmatic(Meteor.settings.public.web3.fortmatic);
    if (window.web3 && window.web3.currentProvider.isFortmatic) {
      return undefined;
    }
    return new Web3(fm.getProvider());
  } else if (Meteor.isServer) {
    const provider = Meteor.settings.private.web3.network;
    return new Web3(new Web3.providers.HttpProvider(provider));
  }
  return undefined;
};

let web3;
if (Meteor.isServer) {
  web3 = _setupWallet();
} else {
  window.web3 = _setupWallet();
}

/**
* @summary get coin from corpus
* @param {string} code of coin to fetch
*/
const _getCoin = (code) => {
  if (Meteor.isClient) {
    if (Session.get('token')) { token = Session.get('token'); }
  }

  let result = _.findWhere(token.coin, { code: code.toUpperCase() });

  if (result.length === 0) {
    result = _.findWhere(token.coin, { subcode: code.toUpperCase() });
  }
  if (result.length === 0) {
    if (code === 'VOTES') {
      result = _.findWhere(token.coin, { code: 'VOTE' });
    } else {
      return { code };
    }
  }
  return result;
};

const _writeZeroes = (quantity) => {
  let template = '';
  for (let i = 0; i < quantity; i += 1) {
    template += '0';
  }
  return template;
};


/**
* @summary turns a number into an aotmic crypto balance quantity string
* @param {number} balance to check
* @param {string} code of the ticker with decimal rule
*/
const _numToCryptoBalance = (balance, code) => {
  const coin = _getCoin(code);
  let target = balance.toString();
  if (target.includes('.')) {
    let zeroes = target.substring(target.indexOf('.') + 1, target.length);
    const delta = parseInt(coin.decimals - zeroes.length, 10);
    if (delta > 0) {
      for (let i = 0; i < delta; i += 1) {
        zeroes += '0';
      }
    } else {
      zeroes = zeroes.substring(0, Math.abs(delta));
    }
    target = `${target.substring(0, target.indexOf('.'))}${zeroes}`;
  }
  return target;
};

/**
* @summary big number to number
* @param {BigNumber} valueBN of a big number
* @param {string} tokenCode token
* @return {number} final value
*/
const _smallNumber = (value, tokenCode) => {
  const coin = _getCoin(tokenCode);
  const valueBN = new BigNumber(value);
  let text = valueBN.toFixed(); // toString().replace('.', '');
  const template = _writeZeroes(coin.decimals + 1);
  if (text.length < template.length) { text = `${_writeZeroes(template.length - text.length)}${text}`; }
  const comma = text.insert('.', (text.length - coin.decimals));
  const final = new BigNumber(comma);
  return final.toNumber();
};


/**
* @summary adjusts decimals of supported tokens, inverse of _addDecimal()
* @param {string} value value in lowest decimal
* @param {number} decimals
* @return {object} bigNumber equivalent with decimals removed
*/
const _removeDecimal = (value, decimals) => {
  const decimalsBN = new BigNumber(decimals);
  const valueBN = new BigNumber(value);
  const divisor = new BigNumber(10).pow(decimalsBN);
  const beforeDecimal = valueBN.div(divisor);

  return beforeDecimal;
};

/**
* @summary adds decimals of supported tokens, inverse of removeDecimal()
* @param {value} value without decimals
* @param {number} decimals
* @return {object} bigNumber equivalent with decimals added
*/
const _addDecimal = (value, decimals) => {
  const decimalsBN = new BigNumber(decimals.toNumber());
  const valueBN = new BigNumber(value);
  const multiplier = new BigNumber(10).pow(decimalsBN);
  const withDecimals = valueBN.multipliedBy(multiplier);

  return withDecimals;
};

/**
* @summary converts wei to eth
* @param {string} value in wei
* @return {number} equivalent in eth
*/
const _wei2eth = (value) => {
  return web3.utils.fromWei(value, 'ether');
};

/**
* @summary gets eth balance from given public address
* @param {string} publicAddress
* @return {object} bigNumber eth balance
*/
const _getEthBalance = (publicAddress) => {
  const balance = web3.eth.getBalance(publicAddress);
  const ethBalance = web3.utils.fromWei(balance, 'ether');
  return ethBalance;
};

/**
* @summary gets wei balance from given public address
* @param {string} publicAddress
* @return {promise} promise returns a string of wei balance
*/
const _getWeiBalance = (publicAddress) => {
  return web3.eth.getBalance(publicAddress);
};

/**
* @summary gets token symbol/code from given public address
* @param {string} publicAddress, contractAddress
* @return {string} symbol
*/
const _getTokenSymbol = (publicAddress, contractAddress) => {
  return new Promise(
    (resolve, reject) => {
      const tokenInstance = new web3.eth.Contract(abi, contractAddress);

      tokenInstance.methods.symbol.call({ from: publicAddress }, (err, symbol) => {
        if (err) { reject(err); }
        if (symbol) { resolve(symbol); }
      });
    }
  );
};

/**
* @summary gets token balance from given public address
* @param {string} publicAddress, contractAddress
* @return {number} balance
*/
const _getTokenBalance = (publicAddress, contractAddress) => {
  return new Promise(
    async (resolve, reject) => {
      const tokenInstance = new web3.eth.Contract(abi, contractAddress);
      await tokenInstance.methods.balanceOf(publicAddress).call((err, balance) => {
        if (err) {
          if (err.message === "Couldn't decode uint256 from ABI: 0x") {
            // TODO - handle return of 0 more gracefully
            resolve('0');
          } else {
            reject(err);
          }
        }
        if (balance) { resolve(balance); }
      });
    }
  );
};

/**
* @summary constructs tokenData object based on given _publicAddress
* @param {string} _publicAddress
* @return {object} tokenData should only contain tokens associated with _publicAddress
*/
const _getTokenData = async (_publicAddress) => {
  const tokenData = [];
  let _balance;

  for (let i = 0; i < token.coin.length; i += 1) {
    if (token.coin[i].type === 'ERC20') {
      _balance = await _getTokenBalance(_publicAddress, token.coin[i].contractAddress);
      if (_balance.toNumber() !== 0) {
        let withoutDecimal;
        if (token.coin[i].nonFungible) {
          withoutDecimal = _removeDecimal(_balance.toNumber(), 0);
        } else {
          withoutDecimal = _removeDecimal(_balance.toNumber(), token.coin[i].decimals);
        }

        const tokenObj = {
          balance: withoutDecimal.toNumber(),
          placed: 0,
          available: withoutDecimal.toNumber(),
          token: token.coin[i].code,
          publicAddress: _publicAddress,
        };

        tokenData.push(tokenObj);
      }
    }
  }
  return tokenData;
};

/**
* @summary shows balance in currency not decimals
* @param {object} value value to be changed
* @param {string} token currency being used
* @returns {number}
*/
const _currencyValue = (value, tokenCode) => {
  switch (tokenCode) {
    case 'WEI':
      return _wei2eth(value.toString());
    // case 'VOTE':
    //   return adjustDecimal(value);
    default:
      return value;
  }
};


/**
* @summary format currency display according to crypto rules
* @param {string} value value to be changed
* @param {string} tokenCode currency being used
* @returns {string} formatted number
*/
const _formatCryptoValue = (value, tokenCode) => {
  let tokenFinal;
  if (!tokenCode) { tokenFinal = 'ETH'; } else { tokenFinal = tokenCode; }
  return numeral(_currencyValue(value, tokenFinal)).format(_getCoin(tokenFinal).format);
};


/**
* @summary get the token balance a user has for a given contract coin
* @param {object} user with token
* @param {object} contract to be checked
* @return {string} the balance quantity
*/
const _getBalance = (user, contract) => {
  let result;
  for (let i = 0; i < user.profile.wallet.reserves.length; i += 1) {
    const coin = _getCoin(user.profile.wallet.reserves[i].token);
    if (coin.code === contract.blockchain.coin.code) {
      if (coin.code === 'ETH') {
        result = _formatCryptoValue(_removeDecimal(Meteor.user().profile.wallet.reserves[i].balance, coin.decimals).toNumber(), coin.code);
      } else if (coin.nonFungible) {
        result = _formatCryptoValue(parseInt(Meteor.user().profile.wallet.reserves[i].balance, 10), coin.code);
      } else {
        result = Meteor.user().profile.wallet.reserves[i].balance;
      }
      return result;
    }
  }
  return undefined;
}

export const wei2eth = _wei2eth;
export const getEthBalance = _getEthBalance;
export const getWeiBalance = _getWeiBalance;
export const getTokenSymbol = _getTokenSymbol;
export const getTokenBalance = _getTokenBalance;
export const removeDecimal = _removeDecimal;
export const smallNumber = _smallNumber;
export const addDecimal = _addDecimal;
export const getCoin = _getCoin;
export const getTokenData = _getTokenData;
export const getBalance = _getBalance;
export const numToCryptoBalance = _numToCryptoBalance;
export const setupWallet = _setupWallet;

