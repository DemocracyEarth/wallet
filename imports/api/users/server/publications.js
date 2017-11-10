import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// The user fields we are willing to publish.
const USER_FIELDS = {
  username: 1,
  profile: 1,
};

Meteor.publish('userData', function () {
  return Meteor.users.find({}, { fields: { profile: 1, username: 1 } });
});

Meteor.publish('singleUser', (query) => {
  check(query, Object);
  return Meteor.users.find(query, { fields: USER_FIELDS });
});
