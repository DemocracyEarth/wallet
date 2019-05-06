import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Accounts } from 'meteor/accounts-base';

import { rules } from '/lib/const';
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
  let username;
  let emails;

  const walletInit = {
    currency: 'STX',
    reserves: [{
      balance: 0,
      placed: 0,
      available: 0,
      token: 'STX',
      publicAddress: user.services.blockstack.userData.identityAddress,
    }],
  };

  profile = _.extend(profile, {
    firstName: name,
    credentials: credential,
    wallet: walletInit,
  });

  if (user.services.blockstack.userData.profile.image && 
      user.services.blockstack.userData.profile.image.length > 0 && 
      user.services.blockstack.userData.profile.image[0].contentUrl) {
    profile.picture = user.services.blockstack.userData.profile.image[0].contentUrl;
  }

  if (user.services.blockstack.token.payload.username === null) {
    let bstackAddress = user.services.blockstack.userData.identityAddress;
    bstackAddress = 'bstack' + bstackAddress.slice(0, 7);
    username = generateAvailableUsername(deburr(toLower(camelCase(bstackAddress))));
  } else {
    const unslicedUsername = user.services.blockstack.token.payload.username;
    // Slice out '.id' or '.id.blockstack' if present
    if (unslicedUsername.indexOf('.id') !== -1) {
      username = unslicedUsername.slice(0, unslicedUsername.indexOf('.id'));
    } else {
      username = unslicedUsername;
    }
  }

  const userPayloadEmail = user.services.blockstack.token.payload.email;
  if (!user.emails && userPayloadEmail !== null) {
    emails = [
      {
        address: userPayloadEmail,
        verified: false,
      },
    ];
  }

  return _.extend(user, {
    username,
    profile,
    emails,
  });
}

function normalizeMetamaskUser(profile, user) {
  const publicAddress = user.services.metamask.id;
  const anonymousUser = `anon-${publicAddress.slice(0, 6)}-${publicAddress.slice(38, 42)}`;
  const username = generateAvailableUsername(deburr(toLower(camelCase(anonymousUser))));

  // other option is to web votes here
  const walletInit = {
    currency: 'WEB VOTE',
    balance: rules.VOTES_INITIAL_QUANTITY,
    placed: 0,
    available: rules.VOTES_INITIAL_QUANTITY,
    reserves: [{
      balance: 0,
      placed: 0,
      available: 0,
      token: 'WEI',
      publicAddress: user.services.metamask.publicAddress,
    }],
  };

  profile = _.extend(profile, {
    wallet: walletInit,
  });

  return _.extend(user, {
    username,
    profile,
  });
}

const normalizers = {
  facebook: normalizeFacebookUser,
  twitter: normalizeTwitterUser,
  blockstack: normalizeBlockstackUser,
  metamask: normalizeMetamaskUser,
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

  return user;
});
