import { Meteor } from 'meteor/meteor';
import { defaults } from '/lib/const';
import Web3 from 'web3';
import { BigNumber } from 'bignumber.js';

/**
* @summary from a given ethereum address creates a user in the db
* @param {string} address 0x ethereum address
* @param {string} settings configuration object
*/
const _migrateAddress = (address, settings) => {
  console.log(`[web3] Migrating address ${address}...`);
  const voter = Meteor.users.find({ username: address.toLowerCase() }).fetch();

  console.log(voter.length);

  // add new voter
  if (voter.length === 0) {
    const template = {
      username: address.toLowerCase(),
      profile: {
        configured: true,
        menu: [],
        picture: '/images/noprofile.png',
        wallet: {
          currency: 'WETH',
          ledger: [],
          placed: 0,
          available: 0,
          balance: 0,
          address: [],
          reserves: [{
            publicAddress: address.toLowerCase(),
            available: 0,
            balance: 0,
            token: 'WETH',
            placed: 0,
          }],
        },
      },
      createdAt: new Date(),
    };
    template.profile = Object.assign(template.profile, settings.profile);
    const voterId = Meteor.users.insert(template);
    console.log(`[web3] Inserted new user ${voterId}`);
  } else {
    console.log(`[web3] Updated user with new settings...`);
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
* @param {string} returnValues object with values
*/
const _parseContent = (title, returnValues) => {
  const web3 = new Web3();
  const keys = Object.keys(returnValues);
  let newTitle = title;
  let match;
  for (let i = 0; i < keys.length; i += 1) {
    // string parameters
    match = title.match(`{{${keys[i]}}}`);
    if (match && match.length > 0) {
      newTitle = newTitle.replace(`{{${keys[i]}}}`, returnValues[keys[i]].toString());
    }

    // currency parameters
    match = title.match(`{{ether ${keys[i]}}}`);
    if (match && match.length > 0) {
      newTitle = newTitle.replace(`{{ether ${keys[i]}}}`, web3.utils.fromWei(returnValues[keys[i]].toString(), 'ether'));
    }
  }
  return newTitle;
};

// returns the contract object type required
const _getContractObject = (user, settings) => {
  return {
    stage: 'LIVE',
    title: settings.title,
    keyword: settings.keyword,
    url: settings.url,
    createdAt: settings.date,
    lastUpdate: settings.date,
    timestamp: settings.date,
    ballotEnabled: false,
    // replyId: '',
    // geo: draft.geo,
    // ballot: draft.ballot,
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
      publicAddress: settings.publicAddress,
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
      votePrice: '0.1',
    },
    rules: {
      alwaysOn: false,
      quadraticVoting: false,
      balanceVoting: true,
      pollVoting: true,
    },
    poll: [],
    closing: {
      blockchain: defaults.CHAIN,
      height: settings.height,
      calendar: settings.calendar,
      delta: 42000,
    },
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
  };
};

export const getContractObject = _getContractObject;
export const migrateAddress = _migrateAddress;
export const parseContent = _parseContent;
