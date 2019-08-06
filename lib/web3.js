import { Meteor } from 'meteor/meteor';
import standardABI from 'human-standard-token-abi';
import { BigNumber } from 'bignumber.js';
import { resolve } from 'url';
import { wei2eth, getCoin } from '/imports/api/blockchain/modules/web3Util';

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
      console.log('[web3] JSON Interface:');
      console.log(contract);
      return contract;
    }
  }
  return undefined;
};

/**
* @summary writes the event log found on the blockchain to database objects according to mapping structure
* @param {object} log with event descriptions from the blockchain
* @param {object} smartContract with info how to write these eventos on the blockchain
*/
const _writeEvents = (log, smartContract) => {
  console.log('[web3] Writing events found on the blockchain to local database...');
  const map = smartContract.map;

  for (let i = 0; i < log.length; i += 1) {
    for (let k = 0; k < map.length; k += 1) {
      if (map[k].eventName === log[i].event) {
        // console.log(`[web3] Adding a new ${map[k].collectionType}`);
        switch (map[k].collectionType) {
          case 'Transaction':
            break;
          case 'Contract':
          default:
            // console.log(log[i]);
            break;
        }
      }
    }
  }
};

const _updateWallet = async (publicAddress, token) => {
  if (_web3()) {
    const coin = getCoin(token);
    console.log(`contractAddress: ${coin.contractAddress}`);
    console.log(`publicAddress: ${publicAddress}`);

    const contract = new web3.eth.Contract(standardABI, coin.contractAddress);
    contract.methods.balanceOf(publicAddress).call({ name: publicAddress }, (error, balance) => {
      console.log('INSIDE BALANCE OF');
      console.log(balance);
      contract.methods.decimals().call((error, decimals) => {
        balance = balance.div(10 ** decimals);
        console.log(balance.toString());
      });
    })
  }
};

/**
* @summary show all the transactions for a given public address
* @param {object} smartContract object from a collective
*/
const _getEvents = async (smartContract) => {
  let eventLog;

  if (_web3()) {
    console.log(`[web3] Getting past events for ${smartContract.publicAddress}...`);
    const abi = JSON.parse(smartContract.abi);

    if (abi) {
      await new web3.eth.Contract(abi, smartContract.publicAddress).getPastEvents('allEvents', {
        fromBlock: START_BLOCK,
        toBlock: 'latest',
      }, (error, log) => {
        if (error) {
          console.log('[web3] Error fetching log data.');
          console.log(error);
        } else {
          console.log(`[web3] Log for ${smartContract.publicAddress} has a length of ${log.length} events.`);
          console.log(`[web3] Events consist of: ${JSON.stringify(_.uniq(_.pluck(log, 'event')))}`);

          if (log.length > 0 && smartContract.map && smartContract.map.length > 0) {
            _writeEvents(log, smartContract);
          }
        }
        return log;
      }).then((res) => {
        eventLog = res;
        return res;
      });
    }
  }
  return eventLog;
};


if (Meteor.isServer) {
  _web3();
}

export const updateWallet = _updateWallet;
export const getEvents = _getEvents;
export const getContract = _getContract;

