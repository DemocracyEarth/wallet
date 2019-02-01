import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { WebApp } from 'meteor/webapp';

import blockstack from 'blockstack';
import { decodeToken } from 'jsontokens';

if (Meteor.isClient) {
  const loginWithBlockstack = (options, callback) => {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = null;
    }

    blockstack.redirectToSignIn(
      `${window.location.origin}/accounts/callbacks/blockstack`,
      `${window.location.origin}/blockstack/manifest.json`,
      ['store_write', 'email']
    );
  };

  Accounts.registerClientLoginFunction('blockstack', loginWithBlockstack);
  Meteor.loginWithBlockstack = function () {
    return Accounts.callLoginFunction('blockstack');
  };
}

Router.route('/accounts/callbacks/blockstack', async function () {
  const { authResponse } = this.params.query;
  if (!authResponse) return;

  // TODO: handle situation where the profile is empty. Ask the user to fill in their profile in their Blockstack browser.
  const userData = await blockstack.handlePendingSignIn();
  window.userData = userData;


  const methodName = 'login';
  const methodArguments = [{ bsToken: authResponse, userData }];
  const router = this;

  Accounts.callLoginMethod({
    methodArguments,
    userCallback: (err) => {
      Accounts._pageLoadLogin({
        type: 'blockstack',
        allowed: !err,
        error: err,
        methodName: methodName,
        methodArguments: methodArguments,
      });
      router.redirect('/');
    },
  });
}, { where: 'client' });

if (Meteor.isServer) {
  /**
  * @summary cleans `userData.profile.apps` keys to get rid of
  * invalid dots ('.') that may be present
  * @param {object} userData
  * @return {object} userData where `apps` is substitued with an
  * array of objects in specific key/pair format:
  * { key: _key, value: apps[_key] }
  */
  function serializeAppsData(userData) {
    const serializedArray = [];
    const apps = userData.profile.apps;

    for (const _key in apps) {
      const keyValuePair = { key: _key, value: apps[_key] };
      serializedArray.push(keyValuePair);
    }

    userData.profile.apps = serializedArray;
    return userData;
  }

  // Enable CORS for the manifest.json file.
  WebApp.rawConnectHandlers.use('/blockstack/manifest.json', function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return next();
  });

  Accounts.registerLoginHandler('blockstack', function (opts) {
    let { bsToken, userData } = opts;
    if (!bsToken) return undefined;

    // TODO: we shouldn't take the userData for granted, as it's coming from the client. Ideally we should fetch the profile
    // server-side, but the handlePendingSignIn can only run in the browser.

    // The Blockstack token is a JWT token. Decode it using the jsontokens lib.
    const decodedToken = decodeToken(bsToken);

    if (!decodedToken || !decodedToken.payload) {
      throw new Error('Blockstack token was invalid.');
    }

    // userData may come with invalid keys
    // https://github.com/DemocracyEarth/sovereign/issues/426
    userData = serializeAppsData(userData);

    const user = Accounts.updateOrCreateUserFromExternalService('blockstack', {
      token: decodedToken,
      userData,
      id: decodedToken.payload.iss,
    });

    console.log(`Created user from Blockstack login: ${user}`);
    return user;
  });
}
