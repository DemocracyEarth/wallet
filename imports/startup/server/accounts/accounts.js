import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Accounts } from 'meteor/accounts-base';

import { convertToSlug } from '/lib/utils';

function normalizeFacebookUser(profile, user) {
  let username = user.username;
  if (username) {
    // No username is defined coming from Facebook login
    let newUsername = convertToSlug(user.profile.firstName) + convertToSlug(user.profile.lastName);
    let i = 0;
    while (Meteor.call('verifyUsername', newUsername, (err, id) => {
      if (id) {
        return false;
      }
      return true;
    })) {
      i += 1;
      newUsername += i;
    }
    username = newUsername;
  }

  const credential = profile.credentials || [];
  credential.push({
    source: 'facebook',
    URL: user.services.facebook.link,
    validated: true,
  });

  const userProfile = _.extend(profile, {
    picture: `http://graph.facebook.com/${user.services.facebook.id}/picture/?type=large`,
    firstName: user.services.facebook.first_name,
    lastName: user.services.facebook.last_name,
    credentials: credential,
  });

  return _.extend(user, {
    username,
    profile: userProfile,
  });
}

function normalizeTwitterUser(profile, user) {
  const credential = profile.credentials || [];
  credential.push({
    source: 'twitter',
    URL: `http://twitter.com/${user.services.twitter.screenName}`,
    validated: true,
  });

  const userProfile = _.extend(profile, {
    picture: user.services.twitter.profile_image_url,
    firstName: user.services.twitter.screenName,
    credentials: credential,
  });

  return _.extend(user, {
    profile: userProfile,
  });
}

/**
* at user creation the following specifications must be met
****/
Accounts.onCreateUser((options, user) => {
  const profile = options.profile;
  if (profile) {
    if (user.services.facebook) {
      return normalizeFacebookUser(profile, user);
    }

    if (user.services.twitter) {
      return normalizeTwitterUser(profile, user);
    }
  }

  return user;
});
