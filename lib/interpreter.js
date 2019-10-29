import { Meteor } from 'meteor/meteor';
import { defaults, log, blocktimes } from '/lib/const';
import Web3 from 'web3';

import { BigNumber } from 'bignumber.js';

/**
* @summary from a given ethereum address creates a user in the db
* @param {string} address 0x ethereum address
* @param {string} settings configuration object
*/
const _migrateAddress = (address, settings) => {
  log(`[web3] Migrating address ${address}...`);
  const voter = Meteor.users.find({ username: address.toLowerCase() }).fetch();

  // add new voter
  if (voter.length === 0) {
    const template = {
      username: address.toLowerCase(),
      profile: {
        configured: true,
        menu: [],
        picture: '/images/noprofile.png',
        wallet: {
          currency: defaults.TOKEN,
          ledger: [],
          placed: 0,
          available: 0,
          balance: 0,
          address: [{
            hash: address.toLowerCase(),
          }],
          reserves: [{
            publicAddress: address.toLowerCase(),
            available: 0,
            balance: 0,
            token: defaults.TOKEN,
            placed: 0,
          }],
        },
      },
      createdAt: new Date(),
    };
    template.profile = Object.assign(template.profile, settings.profile);
    const voterId = Meteor.users.insert(template);
    log(`[web3] Inserted new user ${voterId}`);
  } else {
    log('[web3] Updated user with new settings...');
    const newSettings = settings;
    if (voter.profile && voter.profile.collectives.length > 0) {
      newSettings.profile.collectives = settings.profile.collectives.concat(voter.profile.collectives);
    }
    Meteor.users.update({ _id: voter._id }, { $set: { profile: newSettings.profile } });
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

const _getPeriod = (timestamp, closing, state, index) => {
  const blockTimestamp = parseInt(timestamp * 1000, 10);
  const unixClosing = parseInt(closing.getTime(), 0);
  const now = new Date().getTime();
  const moment = parseInt(unixClosing - now, 10);
  const abortWindow = parseInt(state.abortWindow * state.periodDuration, 10);
  const withGracePeriod = parseInt(state.periodDuration * (state.votingPeriodLength + state.gracePeriodLength + abortWindow), 10);
  const votingPeriod = parseInt(state.periodDuration * state.votingPeriodLength, 10);
  let finality;

  log(`[DATE CALCULATION] blockTimestamp = parseInt(timestamp * 1000, 10); // ${blockTimestamp}`);
  log(`[DATE CALCULATION] unixClosing = parseInt(closing.getTime() * 1000, 0); // ${unixClosing}`);
  log(`[DATE CALCULATION] const now = new Date().getTime(); ${now}}`);
  log(`[DATE CALCULATION] moment = parseInt(unixClosing - now, 10); ${moment}`);
  log(`[DATE CALCULATION] withGracePeriod ${withGracePeriod}`);
  log(`[DATE CALCULATION const votingPeriod = parseInt(state.periodDuration + state.votingPeriodLength, 10);: ${votingPeriod}]`);
  log(`[DATE CALCULATION] state.proposalQueue[index].processed ${JSON.stringify(state.proposalQueue[index].processed)}`);

  const proposal = state.proposalQueue[index];

  if (proposal.processed) {
    finality = 'PROCESSED';
  }
  if (moment <= withGracePeriod) {
    finality = 'GRACE';
  }
  if (moment <= (votingPeriod + state.periodDuration)) {
    finality = 'VOTING';
  }
  if (moment <= state.periodDuration) {
    finality = 'QUEUE';
  }
  if (proposal.processed && moment <= 0) {
    finality = 'COMPLETE';
  }
  if (proposal.aborted) {
    finality = 'ABORTED';
  }
  console.log(finality);
  return finality;
};

const _getCurrentPeriod = (summoningTime, periodDuration) => {
  return parseFloat((new Date().getTime() - summoningTime) / periodDuration, 10);
};

/**
* @summary calculates the proper closing times based on blockchain data
* @param {object} parameter to be used for signature
* @param {number} height reference height from which to calculate
* @param {date} blockTimestamp of the block height
*/
const _getClosingObject = (state, height, blockTimestamp, index) => {
  const periodDuration = new BigNumber(state.periodDuration * 1000).toNumber();
  const votingPeriodLength = new BigNumber(state.votingPeriodLength).toNumber();
  const gracePeriodLength = new BigNumber(state.gracePeriodLength).toNumber();
  const abortWindow = new BigNumber(state.abortWindow).toNumber();
  const votingTotalLength = parseInt(periodDuration * (votingPeriodLength), 10);

  const summoningTime = new BigNumber(state.summoningTime * 1000).toNumber();
  const currentPeriod = _getCurrentPeriod(summoningTime, periodDuration);
  const closingCalendar = new Date(parseInt((blockTimestamp * 1000) + votingTotalLength, 10));
  const transcurredPeriods = parseFloat(currentPeriod - state.proposalQueue[index].startingPeriod, 10);

  log(`[DATE CALCULATION] index // ${index}`);
  log(`[DATE CALCULATION] currentPeriod(): // ${currentPeriod}`);
  log(`[DATE CALCULATION] starting Period: // ${state.proposalQueue[index].startingPeriod}`);
  log(`[DATE CALCULATION] transcurredPeriods: // ${transcurredPeriods}`);

  let period;

  period = 'PROCESS';

  if (transcurredPeriods < (votingPeriodLength + gracePeriodLength)) {
    period = 'GRACE';
  }
  if (transcurredPeriods < votingPeriodLength) {
    period = 'VOTING';
  }

  if (state.proposalQueue[index].processed) {
    period = 'COMPLETE';
  }


  log(`[DATE CALCULATION] blockTimestamp // ${blockTimestamp}`);
  log(`[DATE CALCULATION] votingTotalLength // ${votingTotalLength}`);
  log(`[DATE CALCULATION] closingCalendar // ${closingCalendar}`);
  //   const period = _getPeriod(blockTimestamp, closingCalendar, state, index);
  log(`[DATE CALCULATION] period: ${period}`);
  log('[DATE CALCULATION] -------------------');
  log('[DATE CALCULATION] -------------------');
  log('[DATE CALCULATION] -------------------');
  log('[DATE CALCULATION] -------------------');

  return {
    closing: {
      blockchain: defaults.CHAIN,
      height: parseInt(height + (votingTotalLength / 14), 10),
      calendar: closingCalendar,
      delta: parseInt((periodDuration * votingPeriodLength) / blocktimes.ETHEREUM_SECONDS_PER_BLOCK, 10),
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
  if (typeof settings.didPass === 'boolean') { finalObject.didPass = settings.didPass; }
  if (typeof settings.processed === 'boolean') { finalObject.didPass = settings.processed; }
  if (typeof settings.aborted === 'boolean') { finalObject.aborted = settings.aborted; }

  return finalObject;
};

const _getTransactionObject = (user, settings) => {
  return {
    input: {
      entityId: user._id,
      address: user.profile.wallet.reserves[0].publicAddress,
      entityType: 'INDIVIDUAL',
      quantity: 100,
      currency: defaults.TOKEN,
    },
    output: {
      entityId: settings.poll._id,
      address: settings.address,
      entityType: 'CONTRACT',
      quantity: 100,
      currency: defaults.TOKEN,
    },
    kind: 'CRYPTO',
    contractId: settings.poll._id,
    timestamp: settings.timestamp,
    status: 'CONFIRMED',
    blockchain: {
      tickets: [
        {
          hash: settings.contract.keyword,
          status: 'CONFIRMED',
          value: 100, // TODO: Change with info from ProcessProposal
        },
      ],
      coin: {
        code: defaults.TOKEN,
      },
      publicAddress: '',
      score: {
        totalConfirmed: '0',
        totalPending: '0',
        totalFail: '0',
        finalConfirmed: 0,
        finalPending: 0,
        finalFail: 0,
        value: 0,
      },
    },
    condition: {
      transferable: true,
      portable: true,
    },
  };
};

export const getTransactionObject = _getTransactionObject;
export const getContractObject = _getContractObject;
export const getClosingObject = _getClosingObject;
export const migrateAddress = _migrateAddress;
export const parseContent = _parseContent;
