import { Meteor } from 'meteor/meteor';
import { Collectives } from '/imports/api/collectives/Collectives';

import { getEvents, updateWallet, getLastTimestamp } from '/lib/web3';
import { getTokenData, getCoin } from '/imports/api/blockchain/modules/web3Util';
import { log, timers } from '/lib/const';
import { Contracts } from '/imports/api/contracts/Contracts';

const daoCollectives = [];
let synchronizer;

const _daoToCollective = (dao) => {
  log(`[dao] Adding DAO as a Collective in DB...`);
  Collectives.insert(dao, (error, result) => {
    if (error) {
      log('[dao WARNING] Insert Error.');
      log(error);
    }
    if (result) {
      log('[dao] Successfully inserted');
      daoCollectives.push(Collectives.find({ _id: result }).fetch()[0]);
    }
  });
};

/**
* @summary inserts all daos listed on json to database
*/
const _insertDAOs = async () => {
  const daoJSON = 'lib/dao.json';
  log('[dao] Setting up Distributed Autonomous Organizations..');

  const dao = JSON.parse(Assets.getText(daoJSON)).dao; // eslint-disable-line no-undef
  log(`[dao] Found a total of ${dao.length} DAOs in JSON settings`);

  if (!dao) {
    log('[dao WARNING] No DAO settings found.');
    log("[dao FIX] Add 'lib/dao.json' with list of DAOs to be supported using a Schema.Blockchain object.");
    return undefined;
  }

  let collective = [];
  for (let i = 0; i < dao.length; i += 1) {
    log(`[dao] Adding DAO with domain ${dao[i].domain}...`);
    collective = Collectives.find({ domain: dao[i].domain }).fetch();

    if (collective.length === 0) {
      dao[i].createdAt = new Date();
      dao[i].timestamp = new Date();
      dao[i].lastUpdate = new Date();
      _daoToCollective(dao[i]);
    } else {
      log('[dao] DAO already found in db.');
      daoCollectives.push(collective[0]);
    }
    collective = [];
  }
  return daoCollectives;
};

/**
* @summary from collection of collectives, get all the events related to them on chain
*/
const _insertDAOEvents = async () => {
  let collectives;
  let noCollectives = true;
  while (noCollectives) {
    collectives = Collectives.find().fetch();
    if (collectives.length === 0) {
      noCollectives = true;
    } else {
      noCollectives = false;
    }
  }
  log(`[dao] Found a total of ${collectives.length} collectives to parse.`);
  const daoLogs = [];
  for (let i = 0; i < collectives.length; i += 1) {
    if (collectives[i].profile.blockchain) {
      log(`[dao] Processing ${collectives[i].name}...`);
      if (collectives[i].profile.blockchain.publicAddress && collectives[i].profile.blockchain.coin.code) {
        log(`[dao] Updating wallet of ${collectives[i].name}...`);
        // await updateWallet(collectives[i].profile.blockchain.publicAddress, collectives[i].profile.blockchain.coin.code);
      }
      if (collectives[i].profile.blockchain.smartContracts && collectives[i].profile.blockchain.smartContracts.length > 0) {
        log(`[dao] Reading smart contracts of ${collectives[i].name}...`);
        for (let k = 0; k < collectives[i].profile.blockchain.smartContracts.length; k += 1) {
          if (collectives[i].profile.blockchain.smartContracts[k].abi && !collectives[i].profile.blockchain.smartContracts[k].EIP) {
            await getEvents(collectives[i].profile.blockchain.smartContracts[k], collectives[i]._id).then((res) => {
              daoLogs.push(res);
            });
          }
        }
      }
    }
  }

  return daoLogs;
};

/**
* @summary persists the latest stats of a DAO
*/
const _computeDAOStats = () => {
  const collectives = Collectives.find().fetch();
  const QUERY_KEYWORD = '/?period=';
  let dataKeyworkd;
  let url;
  let count = 0;
  for (let i = 0; i < collectives.length; i += 1) {
    log(`[dao] Computing statistics for ${collectives[i].name}...`);
    for (let k = 0; k < collectives[i].profile.menu.length; k += 1) {
      if (collectives[i].profile.menu[k].url) {
        url = collectives[i].profile.menu[k].url;
        if (collectives[i].profile.menu[k].url.match(QUERY_KEYWORD)) {
          dataKeyworkd = url.replace(QUERY_KEYWORD, '').toUpperCase();
          count = Contracts.find({ period: dataKeyworkd, collectiveId: collectives[i]._id }).count();
        } else if (collectives[i].profile.menu[k].url === '/') {
          count = Contracts.find({ collectiveId: collectives[i]._id, pollId: { $exists: false } }).count();
        }
        log(`[dao] This DAO has ${count} proposals labeled as '${dataKeyworkd ? dataKeyworkd.toLowerCase() : ''}'`);
        if (collectives[i].profile.menu[k].count !== count) {
          collectives[i].profile.menu[k].count = count;
          Collectives.update({ _id: collectives[i]._id }, { $set: { 'profile.menu': collectives[i].profile.menu } });
        }
      }
    }
  }
};

const _buildStruct = (parameter) => {
  const finalStruct = Object();
  console.log(`buildStruct`);
  console.log(`parameter.length: ${parameter.length}`);

  for (let i = 0; i < parameter.length; i += 1) {
    console.log(`parameter[i].type: ${parameter[i].type}`);
    switch (parameter[i].type) {
      case 'address':
        console.log(`parameter[i].name: ${parameter[i].name}`);
        finalStruct[`${parameter[i].name}`] = parameter[i].value.toString();
        break;
      case 'uint256':
        finalStruct[`${parameter[i].name}`] = parseFloat(parameter[i].value);
        break;
      default:
        finalStruct[`${parameter[i].name}`] = parameter[i].value ? parameter[i].value : '';
    }
  }
  console.log(`finalStruct:`);
  console.log(finalStruct);
  return finalStruct;
};

/**
  * @summary updates the period of the posts
  * @return {Number} total count.
  */
const sync = (lastTimestamp) => {
  const feed = Contracts.find({ $or: [{ period: 'VOTING' }, { period: 'GRACE' }, { period: 'QUEUE' }, { period: 'PROCESS' }] }).fetch();

  log(`{ method: 'sync', feed.length: '${feed.length}' }`);

  let newPeriod;
  let smartContracts;
  let state;
  let beginningCycle;
  let beginningTime;
  let abortDuration;
  let abortWindowTime;

  for (let i = 0; i < feed.length; i += 1) {
    const collective = Collectives.findOne({ _id: feed[i].collectiveId });
    if (collective && collective.profile && collective.profile.blockchain && collective.profile.blockchain.smartContracts) {
      smartContracts = collective.profile.blockchain.smartContracts;

      for (let k = 0; k < smartContracts.length; k += 1) {
        if (smartContracts[k].parameter && smartContracts[k].parameter.length > 0) {
          state = _buildStruct(smartContracts[k].parameter);
          if (state.abortWindow && state.periodDuration) {
            abortDuration = parseInt(state.abortWindow * state.periodDuration * 1000, 10);
            break;
          }
        }
      }
    }

    newPeriod = feed[i].period;
    switch (feed[i].period) {
      case 'PROCESS':
        if (lastTimestamp > feed[i].closing.graceCalendar && feed[i].processed) {
          if (!feed[i].aborted) {
            newPeriod = 'COMPLETE';
          }
          if (feed[i].didPass) {
            newPeriod = 'PASSED';
          } else if (feed[i].aborted) {
            newPeriod = 'ABORTED';
          }
        }
        break;
      case 'GRACE':
        if ((lastTimestamp > feed[i].closing.graceCalendar) && !feed[i].processed) {
          newPeriod = 'PROCESS';
        }
        break;
      case 'VOTING':
        if (lastTimestamp > feed[i].closing.calendar) {
          newPeriod = 'GRACE';
        }
        break;
      case 'QUEUE':
      default:
        beginningCycle = parseInt(feed[i].closing.height - feed[i].closing.delta, 10);
        beginningTime = new Date(parseInt(feed[i].closing.summoningTime.getTime() + (beginningCycle * state.periodDuration * 1000), 10));
        if (abortDuration) {
          abortWindowTime = new Date(parseInt(beginningTime.getTime() + abortDuration, 10));
          if (lastTimestamp > abortWindowTime) {
            newPeriod = 'VOTING';
          }
        }
        break;
    }
    if (newPeriod !== feed[i].period) {
      Contracts.update({ _id: feed[i]._id }, { $set: { period: newPeriod } });
    }
  }

  return true;
};

const _syncChain = async () => {
  log('[blockchain] Checking for changes on chain...');
  const timestamp = await getLastTimestamp();
  log(`[blockchain] Last timestamp is: ${timestamp}`);
  if (timestamp) {
    return sync(new Date(timestamp));
  }
  return false;
};

async function waitUntil(condition) {
  return await new Promise((resolve) => {
    const interval = setInterval(() => {
      if (condition) {
        clearInterval(interval);
      }
    }, timers.BLOCKCHAIN_SYNC);
  });
}

/**
* @summary setup DAOs on this server instance
*/
const _setupDAOs = async () => {
  await _insertDAOs().then(async (res) => {
    if (res) {
      await _insertDAOEvents();
      await new Promise(() => { setTimeout(_syncChain, timers.BLOCKCHAIN_SYNC); });
      _computeDAOStats();
    }
  });
};

if (Meteor.isServer) {
  _setupDAOs();
}

export const computeDAOStats = _computeDAOStats;
