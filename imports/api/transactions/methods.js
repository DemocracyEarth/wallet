import { Meteor } from 'meteor/meteor';
import { rules } from '/lib/const';
import { generateWalletAddress, transact } from './transaction';

Meteor.methods({
/*
  // generate first transaction from collective to user's wallet
  genesisTransaction(userId) {
    const user = Meteor.users.findOne({ _id: userId });

    console.log('[genesisTransaction] veryfing genesis...')
    if (user.profile.wallet !== undefined) {
      if (user.profile.wallet.ledger.length > 0) {
        if (user.profile.wallet.ledger[0].entityType === 'COLLECTIVE') {
          console.log('[genesisTransaction] this user already had a genesis');
          return;
        }
        console.log('[genesisTransaction] not found, generating first transactino from collective...');
      }
    }

    user.profile.wallet = generateWalletAddress(user.profile.wallet);
    console.log('[genesisTransaction] generated first address on wallet.');
    Meteor.users.update({ _id: userId }, { $set: { profile: user.profile } });
    transact(Meteor.settings.public.Collective._id, userId, rules.VOTES_INITIAL_QUANTITY);
  },

  executeTransaction(delegatorId, delegateId, quantity, conditions, newStatus) {
    console.log('[transact]');
    var txId = transact(delegatorId, delegateId, quantity, conditions);
    console.log('[transact] ticketId ' + txId);
    if (newStatus != undefined && txId != undefined) {
      return newStatus;
    }
  },

  vote: function  (userId, contractId, quantity, settings) {
    console.log('[vote] ' + userId + ' on contract: ' + contractId + ' with quantity: ' + quantity);
    transact(userId, contractId, quantity, settings);
  },
*/
})
