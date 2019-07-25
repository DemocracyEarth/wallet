import { Meteor } from 'meteor/meteor';
import { BigNumber } from 'bignumber.js';

const Web3 = require('web3');
const ethUtil = require('ethereumjs-util');
const abiDecoder = require('abi-decoder');
const numeral = require('numeral');

const START_BLOCK = 8000000;
let web3;

/**
* @summary check web3 plugin and connects to code obejct
*/
const _web3 = () => {
  if (!web3) {
    console.log('[web3] Connecting to Ethereum node...');
    web3 = new Web3(Meteor.settings.public.web3.network);
  }
  return web3;
};

/**
* @summary show all the transactions for a given public address
* @param {string} publicAddress of a contract.
*/
const _getContract = async (publicAddress, interfaceJSON) => {
  if (_web3()) {
    console.log(`[web3] Getting contract ABI of ${publicAddress}.`);
    const abi = JSON.parse(interfaceJSON);

    if (abi) {
      console.log(abi);
      const contract = new web3.eth.Contract(abi, publicAddress);
      console.log(`[web3] JSON Interface:`);
      console.log(contract);
      return contract;
    }
  }
  return undefined;
};

/**
* @summary show all the transactions for a given public address
* @param {string} publicAddress of a contract.
*/
const _getEvents = async (publicAddress, interfaceJSON) => {
  if (_web3()) {
    console.log(`[web3] Getting past events for ${publicAddress}...`);
    const abi = JSON.parse(interfaceJSON);

    if (abi) {
      const contractEvents = new web3.eth.Contract(abi, publicAddress).getPastEvents('allEvents', {
        fromBlock: START_BLOCK,
        toBlock: 'latest',
      }, (error, log) => {
        if (error) {
          console.log(error);
        } else {
          console.log(`[web3] Log for ${publicAddress} has a length of ${log.length} events.`);
          console.log(`[web3] Events consist of: ${JSON.stringify(_.uniq(_.pluck(log, 'event')))}`);
        }
        return log;
      });

      return contractEvents;
    }
  }
  return undefined;
};


if (Meteor.isServer) {
  _web3();
}

export const getEvents = _getEvents;
export const getContract = _getContract;

