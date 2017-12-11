import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { query } from '/lib/views';
import { Transactions } from '/imports/api/transactions/Transactions';

Meteor.publish('transaction', (terms) => {
  check(terms, Object);
  const parameters = query(terms);

  console.log(`{ publish: 'transaction', user: '${Meteor.user().username}', contractId: '${terms.contractId}' }`);
  return Transactions.find(parameters.find, parameters.options);
});
