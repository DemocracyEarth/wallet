import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { genesisTransaction } from '/imports/api/transactions/transaction';
import { check } from 'meteor/check';

import { Contracts } from '/imports/api/contracts/Contracts';

const _getTime = () => {
  const _time = new Date();
  return _time;
};

Meteor.methods({
    /**
    * @summary sends email verififcation
    * @return {object} email content
    */
  sendVerificationLink() {
    const userId = Meteor.userId();
    console.log(`{ method: 'sendVerificationLink', user: ${Meteor.user().username} }`);
    if (userId) {
      return Accounts.sendVerificationEmail(userId);
    }
    return false;
  },

  /**
  * @summary gives user subsidy with inital tokens
  */
  subsidizeUser() {
    console.log(`{ method: 'subsidizeUser', user: ${Meteor.user().username} }`);
    genesisTransaction(Meteor.user()._id);
  },

  /**
  * @summary reports server time from server to client
  * @return {Date} time
  */
  getServerTime() {
    return _getTime();
  },

  /**
  * @summary counts the total items on a collection.
  * @return {number} total count.
  */
  feedCount(query, options) {
    check(query, Object);
    check(options, Object);

    const count = Contracts.find(query, options).count();

    console.log(`{ method: 'feedCount', user: '${Meteor.user().username}', count: ${count} }`);
    return count;
  },
});

export const getTime = _getTime;
