import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { query } from '/lib/views';
import { Contracts } from '/imports/api/contracts/Contracts';

Meteor.publish('contracts', () => {
  Contracts.find();
});

Meteor.publish('feed', function (terms) {
  check(terms, Object);
  const parameters = query(terms);

  console.log(`{ publish: 'feed', user: '${Meteor.user().username}', `);
  console.log('', terms, ',');
  console.log('', parameters.find, ',');
  console.log(` { length: ${Contracts.find(parameters.find, parameters.options).fetch().length} } }`);

  const feed = Contracts.find(parameters.find, parameters.options);

  if (feed) {
    return feed;
  }

  return this.ready();
});

Meteor.publish('feedCount', function (terms) {
  check(terms, Object);
  const parameters = query(terms);
  Counts.publish(this, 'feedItems', Contracts.find(parameters.find, parameters.options));
});

Meteor.publish('singleContract', (terms) => {
  check(terms, Object);
  const parameters = query(terms);

  console.log(`{ publish: 'singleContract', user: '${Meteor.user().username}', { contractId: ${terms.contractId} }`);
  return Contracts.find(parameters.find, parameters.options);
});
