import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Contracts } from '/imports/api/contracts/Contracts';

Meteor.methods({
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
