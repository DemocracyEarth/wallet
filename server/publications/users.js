// The user fields we are willing to publish.
const USER_FIELDS = {
  username: 1,
  profile: 1
};

Meteor.publish('singleUser', function (userId) {
  // Make sure userId is a string.
  check(userId, String);

  // Publish a single user - make sure only allowed fields are sent.
  return Meteor.users.find(userId, { fields: USER_FIELDS });
});
