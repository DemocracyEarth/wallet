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
        if (collectives[i].profile.menu[k].count !== count) {
          collectives[i].profile.menu[k].count = count;
          Collectives.update({ _id: collectives[i]._id }, { $set: { 'profile.menu': collectives[i].profile.menu } });
        }
      }
    }
  }
};

const _extractTicker = (tokenType) => {
  return toke
}

const _getTokenBalance = (additionQuery, subtractionQuery) => {
  const additions = Contracts.find(additionQuery).fetch();
  const finalSum = _.reduce(additions, (memo, num) => { return parseInt(memo + num.decision.request.toNumber(), 10); }, 0);

  console.log(`finalSum: ${finalSum}`);

  const subs = Contracts.find(subtractionQuery).fetch();
  const finalSub = _.reduce(subs, (memo, num) => { return parseInt(memo + num.decision.sharesToBurn, 10); }, 0);

  console.log(`finalSub: ${finalSub}`);

  return parseInt(finalSum + finalSub, 10).toString();
}

/**
* @summary gets the current value of the guild for each DAO
*/
const _computeDAOGuild = () => {
  const collectives = Collectives.find().fetch();
  let ticker;

  let finalGuild;
  for (let i = 0; i < collectives.length; i += 1) {
    log(`[dao] Updating guild data ${collectives[i].name}...`);
    finalGuild = collectives[i].profile.guild;
    console.log(`collectives[i].profile.guild.length: ${collectives[i].profile.guild.length}`);
    for (let k = 0; k < collectives[i].profile.guild.length; k += 1) {
      switch (collectives[i].profile.guild[k].name) {
        case 'guild-total-shares':
          ticker = collectives[i].profile.guild[k].type.replace('token.', '');
          finalGuild[k].value = _getTokenBalance({ period: 'PASSED', 'decision.requestToken': ticker }, { period: 'RAGEQUIT', 'wallet.currency': ticker });
          log(`[dao] Total shares for this DAO... ${finalGuild[k].value}`);
          Collectives.update({ _id: collectives[i]._id }, { $set: { 'profile.guild': finalGuild } });
          break;
        case 'guild-total-weth':
          break;
        case 'guild-share-value':
          break;
        case 'guild-total-value':
        default:
      }
    }
  }
}


/**
* @summary setup DAOs on this server instance
*/
const _setupDAOs = async () => {
  await _insertDAOs().then(async (res) => {
    if (res) {
      await _insertDAOEvents();
      _computeDAOStats();
      _computeDAOGuild();
    }
  });
};

const _main = async () => {
  await _setupDAOs();
};

if (Meteor.isServer) {
  _main();
}

export const computeDAOStats = _computeDAOStats;
