import { Meteor } from 'meteor/meteor';

/**
* @summary from a given ethereum address creates a user in the db
* @param {string} address 0x ethereum address
* @param {string} settings configuration object
*/
const _migrateAddress = (address, settings) => {
  const voter = Meteor.users.find({ 'profile.wallet.reserves': { $elemMatch: { publicAddress: address } } }).fetch();

  console.log(voter);

  // add new voter
  if (!voter.length) {
    const template = {
      username: address,
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
            publicAddress: address,
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
  }
};

const _parseMapCode = (instruction, parameters) => {
  
}

export const parseMapCode = _parseMapCode;
export const migrateAddress = _migrateAddress;
