import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Accounts } from 'meteor/accounts-base';

import { convertToSlug } from '/lib/utils';
import { deburr, toLower, camelCase } from 'lodash';

function generateAvailableUsername(newUsername) {
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
  return newUsername;
}

function normalizeFacebookUser(profile, user) {
  const credential = profile.credentials || [];
  credential.push({
    source: 'facebook',
    URL: user.services.facebook.link,
    validated: true,
  });

  const userProfile = _.extend(profile, {
    picture: `https://graph.facebook.com/${user.services.facebook.id}/picture/?type=large`,
    firstName: user.services.facebook.first_name,
    lastName: user.services.facebook.last_name,
    credentials: credential,
  });

  let username = user.username;
  if (!username) {
    // No username is defined coming from Facebook login
    let newUsername = convertToSlug(userProfile.firstName) + convertToSlug(userProfile.lastName);
    username = generateAvailableUsername(newUsername);
  }

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

function normalizeBlockstackUser(profile, user) {
  const credential = profile.credentials || [];

  credential.push({
    source: 'blockstack',
    URL: user.services.blockstack.token.payload.profile_url,
    validated: true,
  });

  const { name } = user.services.blockstack.userData.profile;
  profile = _.extend(profile, {
    firstName: name,
    credentials: credential,
  });

  if (user.services.blockstack.userData.profile.image &&
      user.services.blockstack.userData.profile.image.length > 0 &&
      user.services.blockstack.userData.profile.image[0].contentUrl) {
    profile.picture = user.services.blockstack.userData.profile.image[0].contentUrl;
  }

  const username = user.services.blockstack.token.payload.username || generateAvailableUsername(deburr(toLower(camelCase(name))));

  return _.extend(user, {
    username,
    profile,
  });
}

function normalizeMetamaskUser(profile, user) {
  var publicAddress = user.services.metamask.id;
  var anonymousUser = 'anonymous' + publicAddress.slice(0,7);
  const username = generateAvailableUsername(deburr(toLower(camelCase(anonymousUser))));

  return _.extend(user, {
    username,
    profile,
  });
}

function normalizeAuth0(profile, user) {
  const username = user.services.auth0.nickname;
  const credential = profile.credentials || [];

  credential.push({
    source: 'auth0',
    URL: `https://entrar.mivoz.uy`,
    validated: user.services.auth0.email_verified,
  });

  const userProfile = _.extend(profile, {
    picture: user.services.auth0.picture,
    fullName: user.services.auth0.name,
    credentials: credential,
  });

  return _.extend(user, {
    username,
    profile: userProfile,
  });
}

const normalizers = {
  facebook: normalizeFacebookUser,
  twitter: normalizeTwitterUser,
  blockstack: normalizeBlockstackUser,
  metamask: normalizeMetamaskUser,
  auth0: normalizeAuth0
};

/**
* at user creation the following specifications must be met
****/
Accounts.onCreateUser((opts, user) => {
  let profile = opts.profile || {};

  // Find the first normalizer for the first service the user has.
  // Not sure if we need to be so strict, but I'm keeping the contract of the previous impl.
  const normalizer = _.chain(normalizers)
    .pick(Object.keys(user.services || {}))
    .values()
    .first()
    .value();

  user = !!normalizer ? normalizer(profile, user) : user;

  if (user.services.metamask != null) {
    // Initialize reserves for Metamask users only
    let wallet = {}
    let reserves = [{
      balance: 0,
      placed: 0,
      available: 0,
      token: 'WEI',
      publicAddress: user.services.metamask.publicAddress
    }];

    user.profile = profile;
    user.profile.wallet = wallet;
    user.profile.wallet.reserves = reserves;
  }

  return user;
});
