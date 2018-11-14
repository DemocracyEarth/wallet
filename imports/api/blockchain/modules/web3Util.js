import { Meteor } from 'meteor/meteor';
import Web3 from 'web3';
import abi from 'human-standard-token-abi';
import { BigNumber } from 'bignumber.js';
import { token } from '/lib/token';


// Set web3 provider
let web3;
const provider = Meteor.settings.public.web3.network;

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider(provider));
}

/**
* @summary get coin from corpus
* @param {string} code of coin to fetch
*/
const _getCoin = (code) => {
  let result = _.where(token.coin, { code });

  if (result.length === 0) {
    result = _.where(token.coin, { subcode: code });
  }
  if (result.length === 0) {
    if (code === 'VOTES') {
      result = _.where(token.coin, { code: 'VOTE' });
    } else {
      return { code };
    }
  }
  return result[0];
};

const _writeZeroes = (quantity) => {
  let template = '';
  for (let i = 0; i < quantity; i += 1) {
    template += '0';
  }
  return template;
}

/**
* @summary big number to number
* @param {BigNumber} valueBN of a big number
* @param {string} tokenCode token
* @return {number} final value
*/
const _smallNumber = (valueBN, tokenCode) => {
  const coin = _getCoin(tokenCode);
  let text = valueBN.toString();
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
  const decimalsBN = new BigNumber(decimals);
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
    (resolve, reject) => {
      const tokenInstance = new web3.eth.Contract(abi, contractAddress);

      tokenInstance.methods.balanceOf(publicAddress).call((err, balance) => {
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

  for (let i = 0; i < token.coin.length; i++) {
    _balance = await _getTokenBalance(_publicAddress, token.coin[i].contractAddress);
    if (_balance.toNumber() !== 0) {
      const withoutDecimal = _removeDecimal(_balance.toNumber(), token.coin[i].decimals);
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
  return tokenData;
};

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
