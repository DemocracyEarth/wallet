import { Meteor } from 'meteor/meteor';
import { Collectives } from '/imports/api/collectives/Collectives';

import { getContract, getEvents } from '/lib/web3';

/**
* @summary inserts all daos listed on json to database
*/
const _insertDAOs = () => {
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
* @summary from collection of collectives, replicate chain transactions on server
*/
const _getDAOEvents = async () => {
  const collectives = Collectives.find().fetch();
  let daoContract;
  for (let i = 0; i < collectives.length; i += 1) {
    if (collectives[i].profile.blockchain) {
      console.log(`[dao] Looking for smart contracts of ${collectives[i].name}...`);
      if (collectives[i].profile.blockchain.contracts && collectives[i].profile.blockchain.contracts.length > 0) {
        for (let k = 0; k < collectives[i].profile.blockchain.contracts.length; k += 1) {
          if (collectives[i].profile.blockchain.contracts[k].abi) {
            daoContract = await getEvents(collectives[i].profile.blockchain.contracts[k].publicAddress, collectives[i].profile.blockchain.contracts[k].abi).then((res) => {
              return res;
            });
          }
        }
      }
    }
  }
  return daoContract;
};

if (Meteor.isServer) {
  _insertDAOs();
  _getDAOEvents();
}
