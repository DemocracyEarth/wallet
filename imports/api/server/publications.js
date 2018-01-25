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
  const parameters = query(terms);
  if (Meteor.user()) {
    console.log(`{ publish: 'transaction', user: '${Meteor.user().username}', contractId: '${terms.contractId}' }`);
  }
  return Transactions.find(parameters.find, parameters.options);
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
* @summary gets all contracts
*/
Meteor.publish('contracts', () => {
  Contracts.find();
});

/**
* @summary generates feed for a specific user
* @return {Object} querying terms
*/
Meteor.publish('feed', function (terms) {
  check(terms, Object);
  const parameters = query(terms);

  if (Meteor.user()) {
    console.log(`{ publish: 'feed', user: '${Meteor.user().username}', `);
  } else {
    console.log("{ publish: 'feed', user: undefined, ");
  }

  console.log('', terms, ',');
  if (parameters) {
    console.log('', parameters.find, ',');
    console.log(` { length: ${Contracts.find(parameters.find, parameters.options).fetch().length} } }`);

    const feed = Contracts.find(parameters.find, parameters.options);
    if (feed) {
      return feed;
    }
  } else {
    console.log(' } }');
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
* @summary gets information of registered collectives on this instance
*/
Meteor.publish('collectives', () => {
  Collectives.find();
});
