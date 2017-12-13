import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';

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

Router.route('/accounts/callbacks/blockstack', function () {
    const { authResponse } = this.params.query;
    if (!authResponse) return;

    var methodName = 'login';
    var methodArguments = [{ bsToken: authResponse }];
    var router = this;

    Accounts.callLoginMethod({
        methodArguments,
        userCallback: function(err) {
            router.redirect('/');
        }
    });
}, {where: 'client'});

if (Meteor.isServer) {
    Accounts.registerLoginHandler('blockstack', async function(opts) {
        const { bsToken } = opts;
        if (!bsToken) return undefined;

        const valid = await blockstack.verifyAuthResponse(bsToken);
        if (!valid) {
            throw new Error("Blockstack token was invalid.");
        }

        const decodedToken = decodeToken(bsToken);

        if (!decodedToken || !decodedToken.payload) {
            throw new Error("Blockstack token was invalid.");
        }
        const user = Accounts.updateOrCreateUserFromExternalService('blockstack', { 
            token: decodedToken, 
            id: decodedToken.payload.iss 
        });
        console.log(user);
        return user;
    });
}
