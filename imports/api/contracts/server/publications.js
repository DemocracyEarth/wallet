import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { query } from '/lib/views';
import { Contracts } from '/imports/api/contracts/Contracts';

Meteor.publish('contracts', () => {
  Contracts.find();
});

Meteor.publish('feed', (terms) => {
  check(terms, Object);

  const parameters = query(terms);
  return Contracts.find(parameters.find, parameters.options);
});
