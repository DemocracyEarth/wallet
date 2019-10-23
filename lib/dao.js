import { Meteor } from 'meteor/meteor';
import { Collectives } from '/imports/api/collectives/Collectives';

import { getEvents, updateWallet } from '/lib/web3';
import { getTokenData, getCoin } from '/imports/api/blockchain/modules/web3Util';
import { log } from '/lib/const';
import { Contracts } from '../imports/api/contracts/Contracts';

const daoCollectives = [];

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

const _updateDAOWallet = async (collective) => {
  log(`[dao] Wallet address: ${collective.profile.blockchain.publicAddress} & token: ${collective.profile.blockchain.coin.code}...`);
  const coin = getCoin(collective.profile.blockchain.coin.code);
  if (collective.profile.blockchain.publicAddress && coin) {
    const tokenData = await getTokenData(collective.profile.blockchain.publicAddress);
    log(tokenData);
    /* if (balance.toNumber !== 0) {
      const reserves = [{
        available: balance.toNumber(),
        balance: balance.toNumber(),
        placed: 0,
        publicAddress: collective.profile.blockchain.publicAddress,
        token: coin.code,
      }];
      log(balance);
      Collectives.update(collective._id, { $set: { 'profile.blockchain.wallet.reserves': reserves } });
    }*/
  }
};

/**
* @summary inserts all daos listed on json to database
*/
const _insertDAOs = async () => {
  const daoJSON = 'lib/dao.json';
  log('[dao] Setting up Distributed Autonomous Organizations..');

  const dao = JSON.parse(Assets.getText(daoJSON)).dao; // eslint-disable-line no-undef


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
  const collectives = Collectives.find().fetch();
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
  log('dao logs:');
  log(daoLogs);
  return daoLogs;
};

/**
* @summary setup DAOs on this server instance
*/
const _setupDAOs = async () => {
  await _insertDAOs().then(() => {
    _insertDAOEvents();
  });
};

if (Meteor.isServer) {
  _setupDAOs();
}
