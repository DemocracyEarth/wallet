import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { query } from '/lib/views';
import { log, logUser } from '/lib/const';

import { Transactions } from '/imports/api/transactions/Transactions';
import { Files } from '/imports/api/files/Files';
import { Contracts } from '/imports/api/contracts/Contracts';
import { Collectives } from '/imports/api/collectives/Collectives';

log('[starting publications]');

// The user fields we are willing to publish.
const USER_FIELDS = {
  username: 1,
  profile: 1,
};

/**
* @summary gets information of a single user
* @return {Object} user data
*/
Meteor.publish('singleUser', function (userQuery) {
  check(userQuery, Object);
  const users = Meteor.users.find(userQuery, { fields: USER_FIELDS });
  log(`{ publish: 'singleUser', user: ${logUser()}, query: ${JSON.stringify(userQuery)}, count: ${users.count()} }`);
  if (users.count() > 0) {
    return users;
  }
  return this.ready();
});

/**
* @summary transactions between a user and a contract
* @return {Object} querying terms
*/
Meteor.publish('transaction', function (terms) {
  check(terms, Object);
  const parameters = query(terms);
  const transactions = Transactions.find(parameters.find, parameters.options);
  log(`{ publish: 'transaction', user: ${logUser()}, contractId: '${terms.contractId}', count: ${transactions.count()} }`);
  if (transactions.count() > 0) {
    return transactions;
  }
  return this.ready();
});

/**
* @summary get all delegations for the logged user
* @return {Object} querying terms
*/
Meteor.publish('delegations', function (terms) {
  check(terms, Object);
  if (Meteor.user()) {
    if (terms.items.length > 0) {
      const parameters = query(terms);
      terms.items.push(Meteor.userId());
      log(`{ publish: 'delegations', user: ${logUser()}, delegates: '${terms.items}' }`);
      return Transactions.find(parameters.find, parameters.options);
    }
    log(`{ publish: 'delegations', user: ${logUser()}, delegates: [empty] }`);
  }
  return this.ready();
});

/**
* @summary files related to a user account
* @return {Object} file
*/
Meteor.publish('files', function files() {
  const data = Files.find({ userId: this.userId });
  if (data) {
    return data;
  }
  return this.ready();
});


/**
* @summary generates feed that shows every vote
* @return {Object} querying terms
*/
Meteor.publish('tally', function (terms) {
  check(terms, Object);
  const parameters = query(terms);
  let _log = String();

  _log = `{ publish: 'tally', user: ${logUser()}, ${JSON.stringify(terms)}, `;

  if (parameters) {
    _log += (`${JSON.stringify(parameters.find)}, { length: ${Transactions.find(parameters.find, parameters.options).fetch().length} } }`);
    log(_log);

    const feed = Transactions.find(parameters.find, parameters.options);
    if (feed) {
      return feed;
    }
  } else {
    _log += ' } }';
    log(_log);
  }
  return this.ready();
});

/**
* @summary generates feed for a specific user
* @return {Object} querying terms
*/
Meteor.publish('feed', function (terms) {
  check(terms, Object);
  const parameters = query(terms);
  let _log = String();

  _log = `{ publish: 'feed', user: ${logUser()}, ${JSON.stringify(terms)}, `;

  if (parameters) {
    _log += (`${JSON.stringify(parameters.find)}, { length: ${Contracts.find(parameters.find, parameters.options).fetch().length} } }`);
    log(_log);

    const feed = Contracts.find(parameters.find, parameters.options);
    if (feed) {
      return feed;
    }
  } else {
    _log += ' } }';
    log(_log);
  }
  return this.ready();
});


/**
* @summary total number of items on a given feed
* @return {Object} querying terms
*/
Meteor.publish('feedCount', function (terms) {
  check(terms, Object);
  const parameters = query(terms);
  console.log(terms);
  Counts.publish(this, 'feedItems', Contracts.find(parameters.find, parameters.options));
});

/**
* @summary gets a single contract
* @return {Object} querying terms
*/
Meteor.publish('singleContract', function (terms) {
  check(terms, Object);
  const parameters = query(terms);
  log(`{ publish: 'singleContract', user: ${logUser()}, { contractId: '${terms.contractId}' }`);
  return Contracts.find(parameters.find, parameters.options);
});

/**
* @summary gets a specific delegation
* @return {Object} querying terms
*/
Meteor.publish('delegationContracts', function (terms) {
  check(terms, Object);
  if (Meteor.user()) {
    const parameters = query(terms);
    log(`{ publish: 'delegationContracts', user: ${logUser()}, delegateId: '${terms.delegateId}' }`);
    return Contracts.find(parameters.find, parameters.options);
  }
  return this.ready();
});

/**
* @summary loads drafts by user
* @return {Object} querying terms
*/
Meteor.publish('contractDrafts', function (terms) {
  check(terms, Object);
  if (Meteor.user()) {
    const parameters = query(terms);
    const contract = Contracts.find(parameters.find, parameters.options);
    if (contract) {
      log(`{ publish: 'contractDrafts', user: ${logUser()}, insert: false }`);
      return contract;
    }
    log(`{ publish: 'contractDrafts', user: ${logUser()}, insert: true }`);
    Contracts.insert({ keyword: terms.keyword });
    return Contracts.find(parameters.find, parameters.options);
  }
  return this.ready();
});

/**
* @summary gets information of registered collectives on this instance
*/
Meteor.publish('collectives', function () {
  const collectives = Collectives.find();
  if (collectives.count() > 0) {
    return collectives;
  }
  return this.ready();
});
