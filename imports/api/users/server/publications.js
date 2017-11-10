import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { guidGenerator } from '/imports/startup/both/modules/crypto';

// The user fields we are willing to publish.
const USER_FIELDS = {
  username: 1,
  profile: 1
};


// This will be used to store the subscription objects for later management
const subs = {};

// The helper publication
Meteor.publish('helperPublication', function() {
  // #1
  var subscription = this;
  subs[subscription._session.id] = subscription;

  // #2
  subscription.added( 'serverTime', 'a_random_id', {date: new Date()} );

  // #3
  subscription.onStop(function() {
    delete subs[subscription._session.id];
  });
});

Meteor.publish("userData", function () {
  return Meteor.users.find({}, { fields: { profile: 1, username: 1 } });
});

Meteor.publish('singleUser', (userId) => {
  check(userId, String);

  console.log(`[publish] singleUser called for userId ${userId}`);
  return Meteor.users.find({ _id: userId }, { fields: { profile: 1, username: 1 } });

  /*
  const newId = guidGenerator();

  // console.log(Meteor.users.find({ _id: userId}, {fields: {profile: 1});
  const profile = Meteor.users.find({ _id: userId }).fetch()[0].profile;

  this.newId = newId;
  this.profile = profile;

  const subscription = this;
  subs[this.userId] = subscription;

  subscription.added('serverTime', newId, { date: new Date() });
  subscription.onStop(function () {
    delete subs[this.userId];
  });

  Meteor.setInterval(function () {
    const currentTime = new Date();
    for (const subscriptionID in subs) {
      subs[subscriptionID].changed('serverTime', newId, { date: currentTime });
    }
  }, 1000);
  */
});
