import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { query } from '/lib/views';

import { Transactions } from '/imports/api/transactions/Transactions';
import { Files } from '/imports/api/files/Files';
import { Contracts } from '/imports/api/contracts/Contracts';
import { Collectives } from '/imports/api/collectives/Collectives';

// The user fields we are willing to publish.
const USER_FIELDS = {
  username: 1,
  profile: 1,
};

/**
* @summary gets information of a single user
* @return {Object} user data
*/
Meteor.publish('singleUser', (userQuery) => {
  check(userQuery, Object);
  return Meteor.users.find(userQuery, { fields: USER_FIELDS });
});

/**
* @summary transactions between a user and a contract
* @return {Object} querying terms
*/
Meteor.publish('transaction', (terms) => {
  check(terms, Object);
  let username = '[anonymous]';
  if (Meteor.user() && terms.contractId) {
    username = Meteor.user().username;
  }
  const parameters = query(terms);
  console.log(`{ publish: 'transaction', user: '${username}', contractId: '${terms.contractId}' }`);
  return Transactions.find(parameters.find, parameters.options);
});

/**
* @summary get all delegations for the logged user
* @return {Object} querying terms
*/
Meteor.publish('delegations', (terms) => {
  check(terms, Object);
  if (Meteor.user()) {
    const parameters = query(terms);
    terms.items.push(Meteor.userId());
    console.log(`{ publish: 'delegations', user: '${Meteor.user().username}', delegates: '${terms.items}' }`);
    return Transactions.find(parameters.find, parameters.options);
  }
  return undefined;
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
* @summary generates feed for a specific user
* @return {Object} querying terms
*/
Meteor.publish('feed', function (terms) {
  check(terms, Object);
  const parameters = query(terms);
  let log = String();

  if (Meteor.user()) {
    log = `{ publish: 'feed', user: '${Meteor.user().username}', ${JSON.stringify(terms)}, `;
  } else {
    log = `{ publish: 'feed', user: [anonymous], ${JSON.stringify(terms)}, `;
  }

  if (parameters) {
    log += (`${JSON.stringify(parameters.find)}, { length: ${Contracts.find(parameters.find, parameters.options).fetch().length} } }`);
    console.log(log);

    const feed = Contracts.find(parameters.find, parameters.options);
    if (feed) {
      return feed;
    }
  } else {
    log += ' } }';
    console.log(log);
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
  Counts.publish(this, 'feedItems', Contracts.find(parameters.find, parameters.options));
});

/**
* @summary gets a single contract
* @return {Object} querying terms
*/
Meteor.publish('singleContract', (terms) => {
  check(terms, Object);
  const parameters = query(terms);

  console.log(`{ publish: 'singleContract', user: '${Meteor.user().username}', { contractId: ${terms.contractId} }`);
  return Contracts.find(parameters.find, parameters.options);
});

/**
* @summary gets a specific delegation
* @return {Object} querying terms
*/
Meteor.publish('singleDelegation', (terms) => {
  check(terms, Object);
  const parameters = query(terms);

  console.log(`{ publish: 'singleDelegation', user: '${Meteor.user().username}', delegateId: ${terms.delegateId} }`);
  return Contracts.find(parameters.find, parameters.options);
});

/**
* @summary loads drafts by user
* @return {Object} querying terms
*/
Meteor.publish('contractDrafts', (terms) => {
  check(terms, Object);
  if (Meteor.user()) {
    const parameters = query(terms);
    const contract = Contracts.find(parameters.find, parameters.options);
    if (contract) {
      console.log(`{ publish: 'contractDrafts', user: '${Meteor.user().username}', insert: false }`);
      return contract;
    }
    console.log(`{ publish: 'contractDrafts', user: '${Meteor.user().username}', insert: true }`);
    Contracts.insert({ keyword: terms.keyword });
    return Contracts.find(parameters.find, parameters.options);
  }
  return false;
});

/**
* @summary gets information of registered collectives on this instance
*/
Meteor.publish('collectives', () => {
  Collectives.find();
});
