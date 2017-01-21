/*

_____                                                   ______           _   _
|  __ \                                                 |  ____|         | | | |
| |  | | ___ _ __ ___   ___   ___ _ __ __ _  ___ _   _  | |__   __ _ _ __| |_| |__
| |  | |/ _ \ '_ ` _ \ / _ \ / __| '__/ _` |/ __| | | | |  __| / _` | '__| __| '_ \
| |__| |  __/ | | | | | (_) | (__| | | (_| | (__| |_| |_| |___| (_| | |  | |_| | | |
|_____/ \___|_| |_| |_|\___/ \___|_|  \__,_|\___|\__, (_)______\__,_|_|   \__|_| |_/
                                                  __/ |
                                                 |___/

"You never change things by fighting the existing reality. To change something
build a new model that makes the existing model obsolete."
Buckminster Fuller, Great San Francisco Architect.

A Roma, <3

*/
import { Meteor } from 'meteor/meteor';
import { Collectives } from '../../api/collectives/Collectives';


// This script runs the first time Democracy Earth gets implemented on a server.
console.log(Meteor.settings.public.app.name + ' version: ' + Meteor.settings.public.app.version + ' codename: ' + Meteor.settings.public.app.codename );

function setupCollectiveInApp(collective) {
  Meteor.settings.public.Collective._id = collective._id;
  console.log('This server is being run by collective ' + collective.name);
  console.log('The collective can be reached with id ' + collective._id);
}

Meteor.startup(() => {
  // App Cache
  /* appcache issue with browser test: infinite loop
  console.log('[startup] app cache: ' + Meteor.settings.public.app.config.appCache)
  Meteor.AppCache.config({
    chrome: Meteor.settings.public.app.config.appCache,
    firefox: Meteor.settings.public.app.config.appCache,
    safari: Meteor.settings.public.app.config.appCache
  });
  */
  console.log('Verifiying main Collective in server...');
  const dbCollective = Collectives.findOne({ domain: Meteor.settings.public.Collective.domain });
  if (dbCollective) {
    setupCollectiveInApp(dbCollective);
  } else {
    // Organization has no Collective in db yet
    console.log('Installing democracy in server...');
    if (Meteor.settings.public.Collective === undefined) {
      console.log('-- MISSING SETTING: Collective was not found. Please setup settings.json on config/development')
    } else {
      console.log('Setting up main Collective in database...');
      Collectives.insert(Meteor.settings.public.Collective, function(error, result) {
        if (error) console.log ( "-- ERROR: Could not add main collective to database. " + error );
        if (result) {
          console.log ( "SUCCESS: Main collective set up with id " + result );
          setupCollectiveInApp(Collectives.findOne({ domain: Meteor.settings.public.Collective.domain }));
        }
      });
    }
  }

  console.log('Verifying key configuration for this instance...');

  //AWS
  if (Meteor.settings.AWSAccessKeyId == undefined || Meteor.settings.AWSAccessKeyId == "") {
    console.log('-- MISSING SETTING: Amazon Web Services for resource storage keys not configured.');
    console.log('-- FIX: Configure `AWSAccessKeyId`, `AWSSecretAccessKey` and `public.AWSHostingURL` on settings.json.');
  } else {
    console.log('Amazon Web Services for resource storage in cloud... OK');
  }

  //smtpServer
  if (Meteor.settings.smtpServer == undefined || Meteor.settings.smtpServer == "") {
    console.log('-- MISSING SETTING: Mailgun SMTP server keys not configured.');
    console.log('-- FIX: Configure `smtpServer` on settings.json.');
  } else {
    console.log('Mailgun SMTP server for e-mail notificiations... OK');
  }

  //Facebook
  if (Meteor.settings.private.API.facebook.appId == undefined || Meteor.settings.private.API.facebook.appId == "") {
    console.log('-- MISSING SETTING: Facebook API keys not configured.');
    console.log('-- FIX: Configure `private.API.facebook.appId` and `private.API.facebook.appSecret` on settings.json.');
  } else {
    console.log('Facebook API key for identity login... OK');
  }

  //Twitter
  if (Meteor.settings.private.API.twitter.APIKey == undefined || Meteor.settings.private.API.twitter.APIKey == "") {
    console.log('-- MISSING SETTING: Twitter API keys not configured.');
    console.log('-- FIX: Configure `private.API.twitter.APIKey` and `private.API.twitter.APISecret` on settings.json.');
  } else {
    console.log('Twitter API key for identity login... OK');
  }

  //Kadira
  if (Meteor.settings.kadira.appId == undefined || Meteor.settings.kadira.appId == "") {
    console.log('-- MISSING SETTING: Kadira keys for performance app testing not configured.');
    console.log('-- FIX: Configure `kadira.appId` and `kadira.appSecret` on settings.json.');
  } else {
    console.log('Kadira keys for performance app testing... OK');
  }
});
