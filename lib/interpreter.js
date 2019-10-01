import { Meteor } from 'meteor/meteor';

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
    Meteor.users.update({ _id: voter._id }, { $set: { profile: settings.profile } });
  }
};

const _parseMapCode = (instruction, parameters) => {
  
}

export const parseMapCode = _parseMapCode;
export const migrateAddress = _migrateAddress;
