import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import { Email } from 'meteor/email';

import { genesisTransaction } from '/imports/api/transactions/transaction';
import { Contracts } from '/imports/api/contracts/Contracts';
import { getTime } from '/imports/api/time';
import { logUser, log } from '/lib/const';

Meteor.methods({
  /**
  * @summary sends email verififcation
  * @return {Object} email content
  */
  sendVerificationLink() {
    const userId = Meteor.userId();
    log(`{ method: 'sendVerificationLink', user: ${logUser()} }`);
    if (userId) {
      return Accounts.sendVerificationEmail(userId);
    }
    return false;
  },

  /**
  * @summary sends email
  * @return {Object} email content
  */
  sendEmail(to, from, subject, text) {
    // Make sure that all arguments are strings.
    check([to, from, subject, text], [String]);

    // Let other method calls from the same client start running, without
    // waiting for the email sending to complete.
    this.unblock();

    Email.send({ to, from, subject, text });
  },

  /**
  * @summary gives user subsidy with inital tokens
  */
  subsidizeUser() {
    log(`{ method: 'subsidizeUser', user: ${logUser()} }`);
    genesisTransaction(Meteor.user()._id);
  },


  /**
  * @summary given a keyword returns contract id
  * @param {keyword} keyword identify contract by given keyword
  */
  getContract(keyword) {
    check(keyword, String);

    log(`{ method: 'getContract', user: ${logUser()}, keyword: '${keyword}' }`);
    return Contracts.findOne({ keyword });
  },

  /**
  * @summary given a keyword returns contract id
  * @param {keyword} keyword identify contract by given keyword
  */
  getContractById(contractId) {
    check(contractId, String);

    log(`{ method: 'getContractById', user: ${logUser()}, _id: '${contractId}' }`);
    return Contracts.findOne({ _id: contractId });
  },

  /**
  * @summary given a username returns user Id
  * @param {string} keyword identify contract by given keyword
  */
  getUser(username) {
    check(username, String);

    log(`{ method: 'getUser', user: ${logUser()}, keyword: '${username}' }`);
    const user = Meteor.users.findOne({ username });
    return {
      _id: user._id,
      username: user.username,
      profile: user.profile,
    };
  },

  /**
  * @summary returns the quantity of replies in a contract
  * @param {string} contractId contract to search replies for
  */
  countReplies(contractId) {
    check(contractId, String);

    log(`{ method: 'countReplies', user: ${logUser()}, contractId: '${contractId}' }`);
    return Contracts.find({ replyId: contractId }).count();
  },

  /**
  * @summary reports server time from server to client
  * @return {Date} time
  */
  getServerTime() {
    // log(`{ method: 'getServerTime', user: ${logUser()} }`);
    return getTime();
  },

  /**
  * @summary counts the total items on a collection.
  * @return {Number} total count.
  */
  feedCount(query, options) {
    check(query, Object);
    check(options, Object);

    const count = Contracts.find(query, options).count();
    log(`{ method: 'feedCount', user: ${logUser()}, count: ${count} }`);
    return count;
  },

  /**
  * @summary counts the total users on the collective
  * @return {Number} total count.
  */
  userCount() {
    const count = Meteor.users.find().count();
    log(`{ method: 'userCount', user: ${logUser()}, count: ${count} }`);
    return count;
  },
});
