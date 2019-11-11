import { Meteor } from 'meteor/meteor';
import standardABI from 'human-standard-token-abi';
import { TAPi18n } from 'meteor/tap:i18n';
import { Contracts } from '/imports/api/contracts/Contracts';
import { Transactions } from '/imports/api/transactions/Transactions';

import { BigNumber } from 'bignumber.js';
import { migrateAddress, getContractObject, getTransactionObject, parseContent, getFinality } from '/lib/interpreter';

import { log, defaults } from '/lib/const';
import { Math } from 'core-js';

const Web3 = require('web3');
const ethUtil = require('ethereumjs-util');
const abiDecoder = require('abi-decoder');
const numeral = require('numeral');

const START_BLOCK = 5000000;
const precedentCache = [];
let web3;


/**
* @summary check web3 plugin and connects to code obejct
*/
const _web3 = () => {
  if (!web3) {
    log('[web3] Connecting to Ethereum node...');
    web3 = new Web3(new Web3.providers.HttpProvider(Meteor.settings.public.web3.network));
  }
  return web3;
};

/**
* @summary show all the transactions for a given public address
* @param {string} publicAddress of a contract.
*/
const _getContract = async (publicAddress, interfaceJSON) => {
  if (_web3()) {
    log(`[web3] Getting contract ABI of ${publicAddress}.`);
    const abi = JSON.parse(interfaceJSON);

    if (abi) {
      log(abi);
      const contract = new web3.eth.Contract(abi, publicAddress);
      log('[web3] JSON Interface:');
      log(contract);
      return contract;
    }
  }
  return undefined;
};

/*
Example of a contract default:
*/

const _getMembership = (address, values) => {
  if (values.memberAddress && (values.memberAddress === address)) {
    return 'MEMBER';
  }
  if (values.delegateKey && (values.delegateKey === address)) {
    return 'DELEGATE';
  }
  if (values.applicant && (values.applicant === address)) {
    return 'APPLICANT';
  }
  return 'VIEWER';
};

const _timestampToDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return `/${date.getFullYear()}/${parseInt(date.getMonth() + 1, 10)}/${date.getDate()}/`;
};

const _setContract = (importId, contractObject) => {
  const dbContract = Contracts.findOne({ importId });
  if (dbContract) {
    log(`[web3] Updating existing contract with importId: ${importId}...`);

    Contracts.update({ _id: dbContract._id }, { $set: contractObject }, (err, res) => {
      if (err) {
        log(err);
      }
      return res;
    });
    return dbContract._id;
  }
  log(`[web3] Inserting new contract with importId: ${importId}...`);
  return Contracts.insert(contractObject, (err, res) => {
    if (err) {
      log(err);
    }
    return res;
  });
};

const _setTransaction = (userId, pollId, transactionObject) => {
  const dbContract = Transactions.findOne({ $and: [{ 'input.entityId': userId }, { 'output.entityId': pollId }] });
  if (dbContract) {
    log('[web3] Updating existing transaction...');
    Transactions.update({ _id: dbContract._id }, { $set: transactionObject }, (err, res) => {
      if (err) {
        log(err);
      }
      return res;
    });
    return dbContract._id;
  }
  log('[web3] Inserting new transaction...');
  return Transactions.insert(transactionObject, (err, res) => {
    if (err) {
      log(err);
    }
    return res;
  });
};

/**
* @summary obtains the address of a participant and makes sure its persisted in db
* @param {object} res the event data to parse
* @param {string} collectiveId to store to this person
* @param {string} role to return address from
*/
const _getUserAddress = (res, collectiveId, role) => {
  let settings;
  let membership;
  let authorUsername;
  let contractObject;
  if (res && res.returnValues) {
    contractObject = res.returnValues;
  } else {
    contractObject = res;
  }
  const addresses = _.uniq(_.filter(contractObject, (num) => { if (typeof num === 'string') { return web3.utils.isAddress(num); } return false; }));

  for (let i = 0; i < addresses.length; i += 1) {
    if (res.returnValues) {
      membership = _getMembership(addresses[i], res.returnValues);
    }
    if (!role ? (membership === 'MEMBER') : (membership === role)) {
      authorUsername = addresses[i].toLowerCase();
    }
    settings = {
      profile: {
        membership,
        collectives: [collectiveId],
      },
    };
    const user = Meteor.users.findOne({ username: addresses[i].toLowerCase() });
    if (user && user.profile) {
      settings.profile = Object.assign(settings.profile, user.profile);
    }
    migrateAddress(addresses[i], settings);
  }
  return authorUsername;
};

const _getMatchingStateElement = (state, returnValues, structVariable) => {
  for (let i = 0; i < state[structVariable].length; i += 1) {
    // const sharesRequested = new BigNumber(state[structVariable][i].sharesRequested).toNumber();
    if (state[structVariable][i].applicant === returnValues.applicant &&
      state[structVariable][i].proposer === returnValues.memberAddress) {
      return state[structVariable][i].description;
    }
  }
};

/**
* @summary from a log event on chain persists it into a contract database record
* @param {object} log with event descriptions from the blockchain
* @param {object} map with info how to write these eventos on the blockchain
* @param {object} state of the current smart contract being processed
* @param {string} collectiveId this is being subscribed to
*/
const _mirrorContractEvent = (event, map, state, collectiveId) => {
  log(`[web3] Mirroring blockchain event as contract action with collectiveId: ${collectiveId}...`);

  // create users required for this contract
  const authorUsername = _getUserAddress(event, collectiveId, 'MEMBER');
  const user = Meteor.users.findOne({ username: authorUsername });

  if (user) {
    const blockDate = web3.eth.getBlock(event.blockNumber, (err, res) => {
      if (!err) {
        const block = res;
        const index = new BigNumber(event.returnValues.proposalIndex).toString();
        const elements = event.returnValues;

        const userInfo = Meteor.users.findOne({ username: elements.applicant.toLowerCase() });
        if (userInfo) {
          elements.applicantId = userInfo._id;
        }

        const contractDB = Contracts.findOne({ importId: index });
        let contract;

        if (contractDB) {
          log('[web3] Updating contract in DB with block event data..');
          contract = contractDB;
          const finality = getFinality(state, event.blockNumber, block.timestamp, index);

          const contractBlockData = {
            keyword: `${event.transactionHash}`,
            url: `/tx/${event.transactionHash}`,
            date: new Date(block.timestamp * 1000),
            publicAddress: event.returnValues.delegateKey,
            height: event.blockNumber,
            calendar: new Date(block.timestamp * 1000),
            closing: finality.closing,
            period: finality.period,
          };

          contract = Object.assign(contract, contractBlockData);
          const contractObject = getContractObject(user, contract);
          const newContractId = _setContract(contract.importId, contractObject);


          const choices = ['no', 'yes'];
          let choice;
          for (let k = 0; k < choices.length; k += 1) {
            choice = Contracts.findOne({ importId: `${index}-${choices[k]}` });

            log(`[web3] Updating details of poll choice ${index}-${choices[k]}`);

            if (choice) {
              const choiceData = {
                keyword: `${event.transactionHash}/${choices[k]}`,
                url: `/tx/${event.transactionHash}/${choices[k]}`,
                poll: [],
                pollId: newContractId,
                pollChoiceId: k.toString(),
                importId: `${index}-${choices[k]}`,
              };
              _setContract(`${index}-${choices[k]}`, choiceData);
            }
          }
        }
      }
    });
  }
};

/**
* @summary gets the current shares an existing members has
* @param {object} member user data
* @param {string} ticker to check data for in wallet
*/
const _getShares = (member, ticker) => {
  let shares = 0;
  for (let i = 0; i < member.profile.wallet.reserves.length; i += 1) {
    if (member.profile.wallet.reserves[i].token === ticker) {
      shares = member.profile.wallet.reserves[i].balance;
      break;
    }
  }
  return shares;
};

/**
* @summary from a log event on chain persists it into a transaction database record
* @param {object} log with event descriptions from the blockchain
* @param {object} map with info how to write these eventos on the blockchain
* @param {string} collectiveId this is being subscribed to
*/
const _mirrorTransaction = (event, map, collectiveId) => {
  log(`[web3] Mirroring blockchain event as transaction action with collectiveId: ${collectiveId}...`);
  log(event);

  // create users required for this transaction
  const authorUsername = _getUserAddress(event, collectiveId, 'MEMBER');
  const user = Meteor.users.findOne({ username: authorUsername });
  const index = new BigNumber(event.returnValues.proposalIndex).toString();

  if (user) {
    const contract = Contracts.findOne({ importId: index });
    if (contract) {
      let poll;
      switch (event.returnValues.uintVote) {
        case 1: // yes
          poll = Contracts.findOne({ keyword: `${contract.keyword}/yes` });
          break;
        case 2: // no
          poll = Contracts.findOne({ keyword: `${contract.keyword}/no` });
          break;
        default:
      }
      if (poll) {
        web3.eth.getBlock(event.blockNumber, (err, res) => {
          const voter = Meteor.users.findOne({ username: event.returnValues.memberAddress.toLowerCase() });
          log(`[web3] Tallying vote of user ${event.returnValues.memberAddress.toLowerCase()}...`);
          if (voter) {
            log(`[web3] A total of shares: ${_getShares(voter, defaults.TOKEN)}`);
            const shares = _getShares(voter, defaults.TOKEN);
            if (!err) {
              const block = res;
              const ticket = {
                shares,
                timestamp: new Date(block.timestamp * 1000),
                contract: {
                  _id: contract._id,
                },
                poll: {
                  _id: poll._id,
                },
                address: contract.keyword,
                blockchain: {
                  tickets: [
                    {
                      hash: block.blockHash,
                      status: 'CONFIRMED',
                      value: shares.toNumber(),
                    },
                  ],
                  coin: {
                    code: defaults.TOKEN,
                  },
                  publicAddress: event.returnValues.memberAddress.toLowerCase(),
                  score: {
                    totalConfirmed: shares.toString(),
                    totalPending: '0',
                    totalFail: '0',
                    finalConfirmed: shares.toNumber(),
                    finalPending: 0,
                    finalFail: 0,
                    value: 0,
                  },
                },
              };
              const transactionObject = getTransactionObject(user, ticket);
              const userId = user._id;
              const pollId = poll._id;
              const txId = _setTransaction(userId, pollId, transactionObject);

              // store vote in contract
              const pollChoiceContract = Contracts.findOne({ _id: transactionObject.output.entityId });
              log(`[web3] Updating tally in poll choice id: ${transactionObject.output.entityId}`);

              const voterList = pollChoiceContract.tally.voter;
              let found = false;
              for (let i = 0; i < voterList.length; i += 1) {
                if (voterList[i]._id === userId) {
                  found = true;
                  voterList[i].votes = shares;
                }
              }
              if (!found) {
                voterList.push({
                  _id: userId,
                  votes: parseInt(shares, 10),
                });
              }
              pollChoiceContract.tally.lastTransaction = txId;
              pollChoiceContract.tally.voter = voterList;
              Contracts.update({ importId: pollChoiceContract.importId }, { $set: { tally: pollChoiceContract.tally } });
            }
          } else {
            log(err);
          }
        });
      }
    }
  }
};

/**
* @summary checks on a list if the user already received something.
* @param {string} username to check
* @param {array} list of precedents
*/
const _checkPrecedent = (username, list) => {
  let shares = 0;

  for (let i = 0; i < list.length; i += 1) {
    if (list[i].username === username) {
      shares += list[i].shares;
    }
  }
  return shares;
};

/**
* @summary updates the wallet settings for approved processed proposals
* @param {object} log with event descriptions from the blockchain
* @param {object} map with info how to write these eventos on the blockchain
* @param {object} state with status of contract
* @param {string} collectiveId this is being subscribed to
*/
const _mirrorTransactionState = (event, map, state, collectiveId) => {
  log(`[web3][ProcessProposal] Transaction state with collectiveId: ${collectiveId}...`);

  if (event.returnValues.didPass) {
    web3.eth.getBlock(event.blockNumber, (err, res) => {
      const block = res;
      const authorUsername = _getUserAddress(event, collectiveId, 'APPLICANT');
      const applicant = Meteor.users.findOne({ username: authorUsername });

      let reserves;
      const shares = parseInt(parseInt(new BigNumber(event.returnValues.sharesRequested).toNumber(), 10) + _checkPrecedent(authorUsername, precedentCache), 10);

      precedentCache.push({
        username: authorUsername,
        shares,
      });

      if (applicant.profile.wallet) {
        reserves = applicant.profile.wallet.reserves;
        if (reserves) {
          for (let i = 0; i < reserves.length; i += 1) {
            if (reserves[i].token === defaults.TOKEN && reserves[i].publicAddress === authorUsername) {
              reserves[i].balance = shares;
              reserves[i].available = reserves[i].balance;
            }
          }
        }
      } else {
        reserves = [{
          publicAddress: authorUsername,
          token: defaults.TOKEN,
          balance: shares,
          available: shares,
          placed: 0,
        }];
      }
      const settings = {
        profile: {
          membership: 'MEMBER',
          wallet: {
            available: shares,
            balance: shares,
            address: [{
              hash: authorUsername,
            }],
            ledger: [],
            placed: 0,
            reserves,
          },
          memberSince: new Date(block.timestamp * 1000),
        },
      };
      log(`[web3][ProcessProposal] Updating user data with reserves: ${JSON.stringify(reserves)}...`);
      migrateAddress(authorUsername, settings);
    });
  }
};


const _mirrorContractState = (state, index, collectiveId) => {
  const proposal = state.proposalQueue[index];
  log(`[web3] Mirroring blockchain proposal with index ${index}`);

  // create users required for this contract
  const authorUsername = _getUserAddress(proposal, collectiveId, 'MEMBER');
  const user = Meteor.users.findOne({ username: authorUsername });

  if (user && proposal && proposal.applicant) {
    const elements = proposal;

    const userInfo = Meteor.users.findOne({ username: proposal.applicant.toLowerCase() });
    if (userInfo) {
      elements.applicantId = userInfo._id;
    }
    const contract = {
      title: parseContent(TAPi18n.__('moloch-map-submit-proposal'), elements),
      keyword: `${index}`,
      url: `${_timestampToDate(proposal.startingPeriod)}${index}`,
      date: new Date(proposal.startingPeriod * 1000),
      publicAddress: proposal.proposer,
      height: 0,
      calendar: new Date(proposal.startingPeriod * 1000),
      importId: `${index}`,
      pollChoiceId: '',
      pollId: '',
      collectiveId,
      poll: [],
      didPass: proposal.didPass,
      processed: proposal.processed,
      aborted: proposal.aborted,
      closing: {
        blockchain: defaults.CHAIN,
        height: 0,
        calendar: new Date(proposal.startingPeriod * 1000),
        delta: 0,
      },
    };

    const contractObject = getContractObject(user, contract);
    const newContractId = _setContract(contractObject.importId, contractObject);

    // poll
    if (proposal.yesVotes && proposal.noVotes) {
      const yes = new BigNumber(proposal.yesVotes);
      const no = new BigNumber(proposal.noVotes);

      const choices = ['no', 'yes'];
      const choiceContract = [];
      let choice;
      let contractPollChoice;
      for (let k = 0; k < choices.length; k += 1) {
        choice = contract;
        choice.title = TAPi18n.__(`moloch-${choices[k]}`);
        choice.keyword = `${index}/${choices[k]}`;
        choice.pollChoiceId = k.toString();
        choice.importId = `${index}-${choices[k]}`;
        choice.pollId = newContractId;
        choice.poll = [];
        choice.blockchain = {
          score: {
            totalConfirmed: (choices[k] === 'yes') ? yes.toString() : no.toString(),
            finalConfirmed: (choices[k] === 'yes') ? yes.toNumber() : no.toNumber(),
          },
        };
        contractPollChoice = getContractObject(user, choice);
        choiceContract.push(_setContract(`${index}-${choices[k]}`, contractPollChoice));
      }

      // create poll data array
      const finalPoll = [];
      for (let n = 0; n < choiceContract.length; n += 1) {
        finalPoll.push({
          contractId: choiceContract[n],
          totalStaked: (choices[n] === 'yes') ? yes.toString() : no.toString(),
        });
      }

      log(`[web3] Adding new new poll ${JSON.stringify(finalPoll)}`);

      // update original contract
      Contracts.update({ _id: newContractId }, { $set: { poll: finalPoll } });
      log(`[web3] Poll added to contract: ${newContractId}`);
    }
  }
};

/**
* @summary writes the event log found on the blockchain to database objects according to mapping structure
* @param {object} log with event descriptions from the blockchain
* @param {object} smartContract with info how to write these eventos on the blockchain
* @param {string} collectiveId this is being subscribed to
*/
const _writeEvents = (event, smartContract, state, collectiveId) => {
  log('[web3] Writing events found on the blockchain to local database..');
  const map = smartContract.map;

  // TODO: proposalQueue should be obtained from smartContract object
  for (let k = 0; k < state.proposalQueue.length; k += 1) {
    if (state !== null) {
      _mirrorContractState(state, k, collectiveId);
    }
  }

  for (let i = 0; i < event.length; i += 1) {
    for (let k = 0; k < map.length; k += 1) {
      if (map[k].eventName === event[i].event) {
        if (map[k].eventName === event[i].event) {
          if (event[i].event === 'SubmitProposal') {
            _mirrorContractEvent(event[i], map[k], state, collectiveId);
          }
          if (event[i].event === 'ProcessProposal') {
            _mirrorTransactionState(event[i], map[k], state, collectiveId);
          }
          if (event[i].event === 'SubmitVote') {
            _mirrorTransaction(event[i], map[k], collectiveId);
          }
        }
      }
    }
  }
};

const _updateWallet = async (publicAddress, token) => {
  if (_web3()) {
    const coin = getCoin(token);
    log(`contractAddress: ${coin.contractAddress}`);
    log(`publicAddress: ${publicAddress}`);

    const contract = new web3.eth.Contract(standardABI, coin.contractAddress);
    contract.methods.balanceOf(publicAddress).call({ name: publicAddress }, (error, balance) => {
      log('INSIDE BALANCE OF');
      log(balance);
      contract.methods.decimals().call((error, decimals) => {
        balance = balance.div(10 ** decimals);
        log(balance.toString());
      });
    })
  }
};

/**
* @summary checks on contract getter the length to review a specifc struct
* @param {web3} dao contract to analyze
* @param {string} lengthGetter name of the getter
*/
const _getStructLength = async (dao, lengthGetter) => {
  let result;
  await dao.methods[lengthGetter].call({}, (err, res) => {
    if (err) {
      log(err);
    }
    result = new BigNumber(res).toNumber();
    return res;
  });
  return result;
};

/**
* @summary given a list of parameters it will obtain the current state value on chain
* @param {object} smartContract object from a collective
*/
const _getState = async (smartContract) => {
  const state = {};
  const abi = JSON.parse(smartContract.abi);

  log('[web3] Parsing current state of smart contract...');
  const dao = await new web3.eth.Contract(abi, smartContract.publicAddress);

  if (smartContract.parameter) {
    let length = 0;
    const struct = [];
    for (let i = 0; i < smartContract.parameter.length; i += 1) {
      switch (smartContract.parameter[i].type) {
        case 'Proposal':
          log(`[web3] Getting struct data ${smartContract.parameter[i].name}...`);
          if (smartContract.parameter[i].length) {
            length = await _getStructLength(dao, smartContract.parameter[i].length);
          }
          for (let k = 0; k <= length; k += 1) {
            await dao.methods[`${smartContract.parameter[i].name}`](k).call({}, (err, res) => {
              if (err) {
                log(err);
              }
              struct.push(res);
              return res;
            });
          }
          state[smartContract.parameter[i].name] = struct;
          break;
        case 'mapping':
          break;
        default:
          log(`[web3] Getting information for method ${smartContract.parameter[i].name}...`);
          if (dao.methods[smartContract.parameter[i].name]) {
            await dao.methods[smartContract.parameter[i].name].call({}, (err, res) => {
              if (err) {
                log(err);
              }
              state[smartContract.parameter[i].name] = res;
              return res;
            });
          }
      }
    }
  }
  return state;
};

/**
* @summary show all the transactions for a given public address
* @param {object} smartContract object from a collective
* @param {string} collectiveId this is being subscribed to
*/
const _getEvents = async (smartContract, collectiveId) => {
  let eventLog;

  if (_web3()) {
    log(`[web3] Getting past events for ${smartContract.publicAddress}..`);
    const abi = JSON.parse(smartContract.abi);

    if (abi) {
      const state = await _getState(smartContract);

      await new web3.eth.Contract(abi, smartContract.publicAddress).getPastEvents('allEvents', {
        fromBlock: START_BLOCK,
        toBlock: 'latest',
      }, (error, res) => {
        if (error) {
          log('[web3] Error fetching log data.');
          log(error);
        } else {
          log(`[web3] Log for ${smartContract.publicAddress} has a length of ${res.length} events.`);
          log(`[web3] Events consist of: ${JSON.stringify(_.uniq(_.pluck(res, 'event')))}`);

          if (res.length > 0 && smartContract.map && smartContract.map.length > 0) {
            _writeEvents(res, smartContract, state, collectiveId);
          }
        }
        return res;
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

