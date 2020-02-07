import { Meteor } from 'meteor/meteor';
import { Collectives } from '/imports/api/collectives/Collectives';

import { getEvents, syncDAOGuilds, getBlockHeight } from '/lib/web3';
import { log, defaults } from '/lib/const';
import { Contracts } from '/imports/api/contracts/Contracts';
import { Tokens } from '/imports/api/tokens/tokens';

const daoCollectives = [];
let lastServerSyncedBlock = 0;

const _daoToCollective = (dao) => {
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


const _insertToken = (token) => {
  Tokens.insert(token, (error, result) => {
    if (error) {
      log('[dao WARNING] Insert Error.');
      log(error);
    }
    if (result) {
      log('[dao] Successfully inserted');
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
    log("[dao FIX] Add 'lib/dao.json' with list of DAOs to be supported using a Schema.Blockchain object inside a 'dao' Array.");
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
* @summary tokens must be persisted in the db for the long run
*/
const _setupTokens = async () => {
  const tokenJSON = 'lib/token.json';
  log('[dao] Setting up tokens..');

  const token = JSON.parse(Assets.getText(tokenJSON)).coin; // eslint-disable-line no-undef
  log(`[dao] Found a total of ${token.length} tokens in JSON settings`);

  if (!token) {
    log('[dao WARNING] No Token settings found.');
    log("[dao FIX] Add 'lib/token.json' with list of tokens to be supported following a Schema.Token object inside a 'coin' Array.");
    return undefined;
  }

  let coin = [];
  for (let i = 0; i < token.length; i += 1) {
    log(`[dao] Inserting token ${token[i].code}...`);
    coin = Tokens.find({ code: token[i].code }).fetch();

    if (coin.length === 0) {
      _insertToken(token[i]);
    } else {
      log('[dao] Token already found in db.');
    }
    coin = [];
  }
  return Tokens.find().fetch();
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

/**
* @summary dynamic refresh while app runs on latest activity per smart contract
*/
const _refreshDAOs = async () => {
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
  const currentBlock = await getBlockHeight();
  if (lastServerSyncedBlock < currentBlock) {
    log(`[dao] Refreshing DAO activity on block height ${currentBlock}...`);

    let syncFrom;
    for (let i = 0; i < collectives.length; i += 1) {
      if (collectives[i].profile.blockchain && collectives[i].profile.blockchain.smartContracts && collectives[i].profile.blockchain.smartContracts.length > 0) {
        for (let k = 0; k < collectives[i].profile.blockchain.smartContracts.length; k += 1) {
          syncFrom = (collectives[i].profile.lastSyncedBlock) ? (collectives[i].profile.lastSyncedBlock + 1) : defaults.START_BLOCK;
          if (syncFrom < currentBlock) {
            await getEvents(collectives[i].profile.blockchain.smartContracts[k], collectives[i]._id, syncFrom, 'latest');
          }
        }
      }
    }
    lastServerSyncedBlock = currentBlock;
  }
};

/**
* @summary batch refresh instructions.
*/
const _refresh = async () => {
  await _refreshDAOs();
  await syncDAOGuilds();
};

/**
* @summary setup DAOs on this server instance.
*/
const _setupDAOs = async () => {
  await _insertDAOs().then(async (res) => {
    if (res) {
      await _refresh();
    }
  });
};

const _main = async () => {
  await _setupTokens();
  await _setupDAOs();
};

if (Meteor.isServer) {
  _main();
}

export const computeDAOStats = _computeDAOStats;
export const refreshDAOs = _refreshDAOs;
export const refresh = _refresh;
