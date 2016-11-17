import { Meteor } from 'meteor/meteor';
import { ServiceConfiguration } from 'meteor/service-configuration';
import { Accounts } from 'meteor/accounts-base';

Meteor.startup(() => {
  // Facebook
  ServiceConfiguration.configurations.remove({
    service: 'facebook',
  });

  ServiceConfiguration.configurations.insert({
    service: 'facebook',
    appId: Meteor.settings.private.API.facebook.appId,
    secret: Meteor.settings.private.API.facebook.appSecret,
  });

  // Twitter
  Accounts.loginServiceConfiguration.remove({
    service: 'twitter',
  });

  Accounts.loginServiceConfiguration.insert({
    service: 'twitter',
    consumerKey: Meteor.settings.private.API.twitter.APIKey,
    secret: Meteor.settings.private.API.twitter.APISecret,
  });
});
