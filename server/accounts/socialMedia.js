ServiceConfiguration.configurations.remove({
    service: 'facebook'
});

ServiceConfiguration.configurations.insert({
    service: 'facebook',
    appId: Meteor.settings.private.API.facebook.appId,
    secret: Meteor.settings.private.API.facebook.appSecret
});
