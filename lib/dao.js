import { Meteor } from 'meteor/meteor';
import { Collectives } from '/imports/api/collectives/Collectives';

if (Meteor.isServer) {
  const daoJSON = 'lib/dao.json';
  console.log('[dao] Connecting to Distributed Autonomous Networks...');
  const dao = JSON.parse(Assets.getText(daoJSON)).dao; // eslint-disable-line no-undef

  if (!dao) {
    console.log('[dao WARNING] No DAO settings found.');
    console.log("[dao FIX] Add 'lib/dao.json' with list of DAOs to be supported using a Schema.Blockchain object.");
  } else {
    let collective = [];
    for (let i = 0; i < dao.length; i += 1) {
      console.log(`[dao] Looking for DAO with domain ${dao[i].domain}...`);
      collective = Collectives.find({ domain: dao[i].domain }).fetch();

      if (collective.length === 0) {
        console.log(JSON.stringify(dao[i]));
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
        console.log(`[dao] Found.`);
      }
    }
    console.log(dao);
  }
}
