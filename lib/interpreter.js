import { Meteor } from 'meteor/meteor';
import { defaults, log, blocktimes } from '/lib/const';
import Web3 from 'web3';

import { BigNumber } from 'bignumber.js';

const _getUserObject = (address, settings, timestamp) => {
  return {
    username: address.toLowerCase(),
    profile: {
      configured: true,
      menu: [],
      picture: '/images/noprofile.png',
      wallet: {
        currency: defaults.TOKEN,
        ledger: [],
        placed: (settings.wallet && settings.wallet.placed) ? settings.wallet.placed : 0,
        available: (settings.wallet && settings.wallet.available) ? settings.wallet.available : 0,
        balance: (settings.balance && settings.wallet.balance) ? settings.wallet.balance : 0,
        membership: settings.membership ? settings.membership : 'VIEWER',
        address: [{
          hash: address.toLowerCase(),
        }],
        reserves: [{
          publicAddress: address.toLowerCase(),
          available: (settings.wallet && settings.wallet.reserves && settings.wallet.reserves.length > 0) ? settings.wallet.reserves[0].available : 0,
          balance: (settings.wallet && settings.wallet.reserves && settings.wallet.reserves.length > 0) ? settings.wallet.reserves[0].balance : 0,
          token: defaults.TOKEN,
          placed: (settings.wallet && settings.wallet.reserves && settings.wallet.reserves.length > 0) ? settings.wallet.reserves[0].placed : 0,
        }],
      },
    },
    createdAt: new Date(),
  };
};

/**
* @summary from a given ethereum address creates a user in the db
* @param {string} address 0x ethereum address
* @param {string} settings configuration object
* @param {number} timestamp with seconds from a block
*/
const _migrateAddress = (address, settings, timestamp) => {
  log(`[web3] Migrating address ${address}...`);
  const voter = Meteor.users.find({ username: address.toLowerCase() }).fetch();
  const template = _getUserObject(address, settings, timestamp);

  // add new voter
  if (voter.length === 0) {
    template.profile = Object.assign(template.profile, settings.profile);
    const voterId = Meteor.users.insert(template);
    log(`[web3] Inserted new user ${voterId}`);
  } else {
    log(`[web3] Updated user with new settings.. ${address.toLowerCase()}`);
    const newSettings = settings;
    let hasCollective = false;
    if (voter[0].profile && voter[0].profile.collectives && voter[0].profile.collectives.length > 0) {
      for (let k = 0; k < voter[0].profile.collectives.length; k += 1) {
        if (voter[0].profile.collectives[k] === voter[0].profile.collectives) {
          hasCollective = true;
          break;
        }
      }
      if (!hasCollective && settings.profile.collectives) {
        newSettings.profile.collectives = _.uniq(settings.profile.collectives.concat(voter[0].profile.collectives));
      }
    }
    template.profile = Object.assign(template.profile, newSettings.profile);
    Meteor.users.update({ _id: voter[0]._id }, { $set: { profile: template.profile } });
  }
};

/**
* @summary replaces textual content with value from variables on blockchain.
* @param {string} title to be replaced with content
* @param {string} elements object with values
*/
const _parseContent = (title, elements) => {
  const web3 = new Web3();
  const keys = Object.keys(elements);
  let newTitle = title;
  let match;
  for (let i = 0; i < keys.length; i += 1) {
    // string parameters
    match = title.match(`{{${keys[i]}}}`);
    if (match && match.length > 0) {
      newTitle = newTitle.replace(`{{${keys[i]}}}`, elements[keys[i]].toString().replace('\'', '&apos;'));
    }
  
    // currency parameters
    match = title.match(`{{ether ${keys[i]}}}`);
    if (match && match.length > 0) {
      newTitle = newTitle.replace(`{{ether ${keys[i]}}}`, web3.utils.fromWei(elements[keys[i]].toString(), 'ether'));
    }
  }
  return newTitle;
};

/**
* @summary obtaines current period of this dao
* @param {number} summoningTime of the dao
* @param {number} periodDuration the length in seconds of a period
*/
const _getCurrentPeriod = (summoningTime, periodDuration) => {
  return parseFloat((new Date().getTime() - summoningTime) / periodDuration, 10);
};

/**
* @summary calculates the proper closing times based on blockchain data
* @param {object} parameter to be used for signature
* @param {number} height reference height from which to calculate
* @param {date} blockTimestamp of the block height
*/
const _getFinality = (state, blockTimestamp, index) => {
  const periodDuration = new BigNumber(state.periodDuration * 1000).toNumber();
  const gracePeriodLength = new BigNumber(state.gracePeriodLength).toNumber();
  const votingPeriodLength = new BigNumber(state.votingPeriodLength).toNumber();
  const summoningTime = new BigNumber(state.summoningTime * 1000).toNumber();
  const currentPeriod = _getCurrentPeriod(summoningTime, periodDuration);
  const closingCalendar = new Date(parseInt((blockTimestamp + (state.periodDuration * (votingPeriodLength))) * 1000, 10));
  const graceCalendar = new Date(parseInt((blockTimestamp + (state.periodDuration * (votingPeriodLength + gracePeriodLength))) * 1000, 10));
  const transcurredPeriods = parseFloat(currentPeriod - state.proposalQueue[index].startingPeriod, 10);

  let period;

  if (!state.proposalQueue[index].processed) {
    period = 'PROCESS';
  }
  if (transcurredPeriods < 1) {
    period = 'QUEUE';
  }
  if ((transcurredPeriods >= 1) && (transcurredPeriods < votingPeriodLength)) {
    period = 'VOTING';
  }
  if ((transcurredPeriods >= votingPeriodLength) && (transcurredPeriods < (votingPeriodLength + gracePeriodLength))) {
    period = 'GRACE';
  }
  if (state.proposalQueue[index].aborted) {
    period = 'ABORTED';
  }
  if (state.proposalQueue[index].processed) {
    if (!state.proposalQueue[index].aborted) {
      period = 'COMPLETE';
    }

    if (state.proposalQueue[index].didPass) {
      period = 'PASSED';
    } else if (!state.proposalQueue[index].aborted) {
      period = 'REJECTED';
    }
  }

  return {
    closing: {
      blockchain: defaults.CHAIN,
      height: parseInt(state.proposalQueue[index].startingPeriod, 10) + parseInt(votingPeriodLength, 10),
      calendar: closingCalendar,
      graceCalendar,
      summoningTime,
      periodDuration,
      delta: parseInt(votingPeriodLength, 10),
    },
    period,
  };
};

/**
* @summary returns the contract object type required
* @param {object} user to be used for signature
* @param {object} settings customization of this contract
*/
const _getContractObject = (user, settings) => {
  const finalObject = {
    stage: 'LIVE',
    kind: 'VOTE',
    title: settings.title,
    keyword: settings.keyword,
    url: settings.url,
    createdAt: settings.date,
    lastUpdate: settings.date,
    timestamp: settings.date,
    ballotEnabled: false,
    constituencyEnabled: false,
    constituency: [
      {
        kind: 'TOKEN',
        code: defaults.TOKEN,
        check: 'EQUAL',
      },
    ],
    wallet: {
      balance: 0,
      placed: 0,
      available: 0,
      currency: defaults.TOKEN,
      address: [],
      ledger: [],
    },
    blockchain: {
      publicAddress: settings.publicAddress.toLowerCase(),
      tickets: [],
      score: {
        totalConfirmed: '0',
        totalPending: '0',
        totalFail: '0',
        finalConfirmed: 0,
        finalPending: 0,
        finalFail: 0,
        value: 0,
      },
      coin: {
        code: defaults.TOKEN,
      },
    },
    rules: {
      alwaysOn: false,
      quadraticVoting: false,
      balanceVoting: false,
      pollVoting: true,
    },
    poll: settings.poll,
    closing: settings.closing,
    importId: settings.importId,
    signatures: [
      {
        _id: user._id,
        role: 'AUTHOR',
        username: user.username,
        status: 'CONFIRMED',
      },
    ],
    pollChoiceId: settings.pollChoiceId,
    pollId: settings.pollId,
    totalReplies: 0,
    collectiveId: settings.collectiveId,
  };

  if (typeof settings.period === 'string') { finalObject.period = settings.period; }
  if (settings.blockchain && settings.blockchain.score) { finalObject.blockchain.score = settings.blockchain.score; }
  if (settings.decision) { finalObject.decision = settings.decision; }
  if (settings.tally && settings.tally.voter) { finalObject.tally.voter = settings.tally.voter; }
  if (typeof settings.didPass === 'boolean') { finalObject.didPass = settings.didPass; }
  if (typeof settings.processed === 'boolean') { finalObject.processed = settings.processed; }
  if (typeof settings.aborted === 'boolean') { finalObject.aborted = settings.aborted; }

  return finalObject;
};

const _getTransactionObject = (user, settings) => {
  return {
    input: {
      entityId: user._id,
      address: user.username.toLowerCase(),
      entityType: 'INDIVIDUAL',
      quantity: settings.shares,
      currency: defaults.TOKEN,
    },
    output: {
      entityId: settings.poll._id,
      address: settings.address,
      entityType: 'CONTRACT',
      quantity: settings.shares,
      currency: defaults.TOKEN,
    },
    kind: 'CRYPTO',
    contractId: settings.contract._id,
    collectiveId: settings.collectiveId,
    timestamp: settings.timestamp,
    status: 'CONFIRMED',
    blockchain: settings.blockchain,
    condition: {
      transferable: true,
      portable: true,
    },
  };
};

export const getTransactionObject = _getTransactionObject;
export const getContractObject = _getContractObject;
export const getFinality = _getFinality;
export const migrateAddress = _migrateAddress;
export const parseContent = _parseContent;
