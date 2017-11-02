/* eslint-disable func-names, prefer-arrow-callback */
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { assert } from 'meteor/practicalmeteor:chai';

import './accounts.js';

describe('accounts', function () {
  describe('on create user', function () {
    beforeEach(function () {
      Meteor.users.remove({});
    });

    it('normalizes facebook data', function () {
      const fbUser = {
        id: 1,
        first_name: 'neymar',
        last_name: 'jr',
        link: 'https://facebook.com/neymarjr',
      };

      const userId = Accounts.updateOrCreateUserFromExternalService(
        'facebook',
        fbUser,
        { profile: {} }
      ).userId;

      const user = Meteor.users.findOne(userId);

      assert.equal(user.profile.picture, `http://graph.facebook.com/${fbUser.id}/picture/?type=large`);
      assert.equal(user.profile.firstName, fbUser.first_name);
      assert.equal(user.profile.lastName, fbUser.last_name);
      assert.equal(user.profile.credentials[0].URL, fbUser.link);
      assert.equal(user.username, fbUser.first_name + fbUser.last_name);
    });

    it('normalizes twitter data', function () {
      const twitterUser = {
        email: 'test@democracy.earth',
        id: 1,
        profile_image_url: 'http://profile.img',
        screenName: 'neymar',
      };

      const userId = Accounts.updateOrCreateUserFromExternalService(
        'twitter',
        twitterUser,
        { profile: {} }
      ).userId;

      const user = Meteor.users.findOne(userId);

      assert.equal(user.profile.picture, twitterUser.profile_image_url);
      assert.equal(user.profile.firstName, twitterUser.screenName);
      assert.equal(user.profile.credentials[0].URL, `http://twitter.com/${twitterUser.screenName}`);
    });

    it('creates user with empty username', function () {
      // Houston admin sends an empty username when creating user
      const userMock = {
        email: 'test@democracy.earth',
        password: 'secret@123',
        username: '',
      };

      assert.doesNotThrow(() => Accounts.createUser(userMock), Error);
    });
  });
});
