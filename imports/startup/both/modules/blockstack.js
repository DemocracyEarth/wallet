import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import { WebApp } from 'meteor/webapp';

import blockstack from 'blockstack';
import { decodeToken } from 'jsontokens';

if (Meteor.isClient) {
    const loginWithBlockstack = function(options, callback) {
        if (!callback && typeof options === "function") {
          callback = options;
          options = null;
        }

        blockstack.redirectToSignIn(
            `${window.location.origin}/accounts/callbacks/blockstack`,
            `${window.location.origin}/blockstack/manifest.json`
        );
    };

    Accounts.registerClientLoginFunction('blockstack', loginWithBlockstack);
    Meteor.loginWithBlockstack = function() {
        return Accounts.applyLoginFunction('blockstack', arguments);
    };
}

Router.route('/accounts/callbacks/blockstack', async function () {
    const { authResponse } = this.params.query;
    if (!authResponse) return;

    // TODO: handle situation where the profile is empty. Ask the user to fill in their profile in their Blockstack browser.
    const userData = await blockstack.handlePendingSignIn();
    window.userData = userData;

    // https://github.com/blockstack/blockstack.js/issues/307
    // We cannot differentiate HTTP 404 errors when the profile was not found vs. empty profiles, as the handlePendingSignIn
    // just returns a default empty profile. So we make the name compulsory, which is an indication that the profile has been
    // filled in.
    if (!userData.profile.name) {
        const msg = 'Blockstack login failed, likely because the profile was not found. Have you filled in your Blockstack profile?';
        console.log(msg)
        throw new Error(msg);
    }

    var methodName = 'login';
    var methodArguments = [{ bsToken: authResponse, userData }];
    var router = this;

    Accounts.callLoginMethod({
        methodArguments,
        userCallback: function (err) {
            Accounts._pageLoadLogin({
                type: 'blockstack',
                allowed: !err,
                error: err,
                methodName: methodName,
                methodArguments: methodArguments
            })
            router.redirect('/');            
        }
    });
}, { where: 'client' });

if (Meteor.isServer) {
    // Enable CORS for the manifest.json file.
    WebApp.rawConnectHandlers.use("/blockstack/manifest.json", function(req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        return next();
    });
    
    Accounts.registerLoginHandler('blockstack', function(opts) {
        const { bsToken, userData } = opts;
        if (!bsToken) return undefined;

        // Verifies that the signatures match the pubkey, the expiration date is valid, etc.
        const valid = blockstack.verifyAuthResponse(bsToken);
        if (!valid) {
            throw new Error("Blockstack token was invalid.");
        }

        // TODO: we shouldn't take the userData for granted, as it's coming from the client. Ideally we should fetch the profile
        // server-side, but the handlePendingSignIn can only run in the browser.

        // The Blockstack token is a JWT token. Decode it using the jsontokens lib.
        const decodedToken = decodeToken(bsToken);

        console.log(`*** blockstack raw decoded token: ${decodedToken}`);
        console.log(`*** blockstack userData: ${userData}`);

        if (!decodedToken || !decodedToken.payload) {
            throw new Error("Blockstack token was invalid.");
        }
        const user = Accounts.updateOrCreateUserFromExternalService('blockstack', {
            token: decodedToken, 
            userData,
            id: decodedToken.payload.iss
        });

        console.log(`Created user from Blockstack login: ${user}`);
        return user;
    });
}
