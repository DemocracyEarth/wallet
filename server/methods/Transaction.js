Meteor.methods({

  //generate first transaction from collective to user's wallet
  genesisTransaction: function (userId) {
    var user = Meteor.users.findOne({ _id: userId });
    user.profile.wallet = Modules.server.generateWalletAddress(user.profile.wallet);
    console.log('[genesisTransaction] generated first address on wallet.');
    Meteor.users.update({ _id: userId }, { $set: { profile : user.profile } });
    Modules.server.transact(Meteor.settings.public.Collective._id, userId, VOTES_INITIAL_QUANTITY);
  },

  executeTransaction: function (delegatorId, delegateId, quantity, conditions, newStatus) {
    console.log('[transact]');
    var txId = Modules.server.transact(delegatorId, delegateId, quantity, conditions);
    console.log('[transact] ticketId ' + txId);
    if (newStatus != undefined && txId != undefined) {
      return newStatus;
    }
  }

})
