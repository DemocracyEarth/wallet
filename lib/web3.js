import { Meteor } from 'meteor/meteor';
import { BigNumber } from 'bignumber.js';

const Web3 = require('web3');
const ethUtil = require('ethereumjs-util');
const abiDecoder = require('abi-decoder');
const numeral = require('numeral');

let web3;

if (Meteor.isServer) {
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

  _web3();

  export const getContract = _getContract;
}
