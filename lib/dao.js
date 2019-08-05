import { Meteor } from 'meteor/meteor';
import { Collectives } from '/imports/api/collectives/Collectives';

import { getEvents } from '/lib/web3';
import { getTokenBalance, getCoin } from '/imports/api/blockchain/modules/web3Util';

const daoCollectives = [];

const _daoToCollective = (dao) => {
  Collectives.insert(dao, (error, result) => {
    if (error) {
      console.log('[dao WARNING] Insert Error.');
      console.log(error);
    }
    if (result) {
      console.log('[dao] Successfully inserted');
      daoCollectives.push(Collectives.find({ _id: result }).fetch()[0]);
    }
  });
}

/**
* @summary inserts all daos listed on json to database
*/
const _insertDAOs = async () => {
  const daoJSON = 'lib/dao.json';
  console.log('[dao] Setting up Distributed Autonomous Organizations...');

  const dao = JSON.parse(Assets.getText(daoJSON)).dao; // eslint-disable-line no-undef


  if (!dao) {
    console.log('[dao WARNING] No DAO settings found.');
    console.log("[dao FIX] Add 'lib/dao.json' with list of DAOs to be supported using a Schema.Blockchain object.");
    return undefined;
  }

  let collective = [];
  let coin;
  for (let i = 0; i < dao.length; i += 1) {
    console.log(`[dao] Adding DAO with domain ${dao[i].domain}...`);
    collective = Collectives.find({ domain: dao[i].domain }).fetch();
    console.log(dao[i]);
    coin = getCoin(dao[i].profile.blockchain.coin.code);
    console.log(`[dao] This dao works with token ${coin.code}...`);

    if (collective.length === 0) {
      console.log(`[dao] Inserting new DAO to Collectives collection...`);
      
      console.log(`[dao] Get transaction data for DAOs main public address...`);
      if (dao[i].profile.blockchain.publicAddress && coin) {
        const wallet = {
          available: 0,
          balance: 0,
          reserves: [],
        };
        dao[i].wallet = wallet;
      }

      console.log(`[dao] Adding DAO as a Collective in DB...`);
      _daoToCollective(dao[i]);
    } else {
      console.log('[dao] DAO found in db');
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
  console.log(`[dao] Found a total of ${collectives.length} collectives to parse.`);
  const daoLogs = [];
  for (let i = 0; i < collectives.length; i += 1) {
    if (collectives[i].profile.blockchain) {
      console.log(`[dao] Looking for smart contracts of ${collectives[i].name}...`);
      if (collectives[i].profile.blockchain.smartContracts && collectives[i].profile.blockchain.smartContracts.length > 0) {
        for (let k = 0; k < collectives[i].profile.blockchain.smartContracts.length; k += 1) {
          if (collectives[i].profile.blockchain.smartContracts[k].abi && !collectives[i].profile.blockchain.smartContracts[k].EIP) {
            await getEvents(collectives[i].profile.blockchain.smartContracts[k]).then((res) => {
              daoLogs.push(res);
            });
          }
        }
      }
    }
  }
  console.log('dao logs:');
  console.log(daoLogs);
  return daoLogs;
};

/**
* @summary setup DAOs on this server instance
*/
const _setupDAOs = async () => {
  await _insertDAOs().then(() => {
    // _insertDAOEvents();
  });
};

if (Meteor.isServer) {
  _setupDAOs();
}
