import { Meteor } from 'meteor/meteor';
import Web3 from 'web3';
import abi from 'human-standard-token-abi';
import { BigNumber } from 'bignumber.js';
import { token } from '/lib/token';

// Set web3 provider
let web3;
const provider = Meteor.settings.public.web3.network.local;

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider(provider));
}

/**
* @summary gets eth balance from given public address
* @param {string} publicAddress
* @return {object} bigNumber eth balance
*/
const _getEthBalance = (publicAddress) => {
  const balance = web3.eth.getBalance(publicAddress);
  const ethBalance = web3.fromWei(balance, 'ether');
  return ethBalance;
};

/**
* @summary gets wei balance from given public address
* @param {string} publicAddress
* @return {object} bigNumber wei balance
*/
const _getWeiBalance = (publicAddress) => {
  const balance = web3.eth.getBalance(publicAddress);
  return balance;
};

/**
* @summary gets token symbol/code from given public address
* @param {string} publicAddress
* @return {string} symbol
*/
const _getTokenSymbol = (publicAddress) => {
  return new Promise(
    (resolve, reject) => {
      const contractAddress = token.coin[1].contractAddress;
      const contract = web3.eth.contract(abi).at(contractAddress);

      contract.symbol.call({ from: publicAddress }, (err, symbol) => {
        if (err) { reject(err); }
        resolve(symbol);
      });
    }
  );
};

/**
* @summary gets token balance from given public address
* @param {string} publicAddress
* @return {number} balance
*/
const _getTokenBalance = (publicAddress) => {
  return new Promise(
    (resolve, reject) => {
      const contractAddress = token.coin[1].contractAddress;
      const contract = web3.eth.contract(abi).at(contractAddress);

      contract.balanceOf.call(publicAddress, (err, balance) => {
        if (err) { reject(err); }
        resolve(balance.toNumber());
      });
    }
  );
};

/**
* @summary converts wei to eth
* @param {number} value in wei
* @return {number} equivalent in eth
*/
const _wei2eth = (value) => {
  return web3.fromWei(value, 'ether');
};

/**
* @summary adjusts decimals of supported tokens
* @param {number} value in lowest decimal
* @return {number} equivalent with 18 decimals
*/
const _adjustDecimal = (value) => {
  /* NOTE - this method could also take in two
  arguments (value, token) so value gets adjusted
  according to what token.coin[i].decimals specifies
  */

  const decimalsBN = new BigNumber(18);
  const valueBN = new BigNumber(value);
  const divisor = new BigNumber(10).pow(decimalsBN);
  const beforeDecimal = valueBN.div(divisor);

  return beforeDecimal;
};

export const wei2eth = _wei2eth;
export const getEthBalance = _getEthBalance;
export const getWeiBalance = _getWeiBalance;
export const getTokenSymbol = _getTokenSymbol;
export const getTokenBalance = _getTokenBalance;
export const adjustDecimal = _adjustDecimal;
