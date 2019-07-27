import { Meteor } from 'meteor/meteor';
import { Collectives } from '/imports/api/collectives/Collectives';

import { getEvents } from '/lib/web3';

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
  } else {
    let collective = [];
    for (let i = 0; i < dao.length; i += 1) {
      console.log(`[dao] Adding DAO with domain ${dao[i].domain}...`);
      collective = Collectives.find({ domain: dao[i].domain }).fetch();

      if (collective.length === 0) {
        Collectives.insert(dao[i], (error, result) => {
          if (error) {
            console.log('[dao WARNING] Insert Error.');
            console.log(error);
          }
          if (result) {
            console.log('[dao] Successfully added.');
          }
        });
      } else {
        console.log('[dao] DAO found.');
      }
    }
  }
};

/**
* @summary from collection of collectives, get all the events related to them on chain
*/
const _getDAOEvents = async () => {
  const collectives = Collectives.find().fetch();
  const daoLogs = [];
  for (let i = 0; i < collectives.length; i += 1) {
    if (collectives[i].profile.blockchain) {
      console.log(`[dao] Looking for smart contracts of ${collectives[i].name}...`);
      if (collectives[i].profile.blockchain.contracts && collectives[i].profile.blockchain.contracts.length > 0) {
        for (let k = 0; k < collectives[i].profile.blockchain.contracts.length; k += 1) {
          if (collectives[i].profile.blockchain.contracts[k].abi && !collectives[i].profile.blockchain.contracts[k].EIP) {
            await getEvents(collectives[i].profile.blockchain.contracts[k].publicAddress, collectives[i].profile.blockchain.contracts[k].abi).then((res) => {
              daoLogs.push(res);
            });
          }
        }
      }
    }
  }
  console.log('daologs:');
  console.log(daoLogs);
  return daoLogs;
};

/**
* @summary setup DAOs on this server instance
*/
const _setupDAOs = async () => {
  await _insertDAOs().then(() => {
    _getDAOEvents();
  });
};

if (Meteor.isServer) {
  _setupDAOs();
}
