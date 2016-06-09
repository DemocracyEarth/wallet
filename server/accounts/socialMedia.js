Meteor.startup(function () {

  //Facebook

  ServiceConfiguration.configurations.remove({
      service : 'facebook'
  });

  ServiceConfiguration.configurations.insert({
      service : 'facebook',
      appId   : Meteor.settings.private.API.facebook.appId,
      secret  : Meteor.settings.private.API.facebook.appSecret
  });


  //Twitter

  Accounts.loginServiceConfiguration.remove({
    service : 'twitter'
  });

  Accounts.loginServiceConfiguration.insert({
    service     : 'twitter',
    consumerKey : Meteor.settings.private.API.twitter.APIKey,
    secret      : Meteor.settings.private.API.twitter.APISecret
  });

});
