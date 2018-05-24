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
console.log(`[startup] ${Meteor.settings.public.app.name} version: ${Meteor.settings.public.app.version} codename: ${Meteor.settings.public.app.codename}`);

function setupCollectiveInApp(collective) {
  Meteor.settings.public.Collective._id = collective._id;
  console.log(`[startup] This server is being run by collective ${collective.name}`);
  console.log(`[startup] The collective can be reached with id ${collective._id}`);
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
  console.log('[startup] Verifiying main Collective in server...');
  const dbCollective = Collectives.findOne({ domain: Meteor.settings.public.Collective.domain });
  if (dbCollective) {
    setupCollectiveInApp(dbCollective);
  } else {
    // Organization has no Collective in db yet
    console.log('[startup] Installing democracy in server...');
    if (Meteor.settings.public.Collective === undefined) {
      console.log('[WARNING] Collective was not found. Please setup settings.json on config/development');
    } else {
      console.log('[startup] Setting up main Collective in database...');
      Collectives.insert(Meteor.settings.public.Collective, function (error, result) {
        if (error) console.log(`[ERROR] Could not add main collective to database. ${error}`);
        if (result) {
          console.log(`[startup] Main collective set up with id ${result}`);
          setupCollectiveInApp(Collectives.findOne({ domain: Meteor.settings.public.Collective.domain }));
        }
      });
    }
  }

  console.log('[config] Verifying key configuration for this instance...');

  // AWS
  if (Meteor.settings.AWSAccessKeyId === undefined || Meteor.settings.AWSAccessKeyId === '') {
    console.log('[config WARNING] Amazon Web Services for resource storage keys not configured.');
    console.log('[config FIX] Configure `AWSAccessKeyId`, `AWSSecretAccessKey` and `public.AWSHostingURL` on settings.json.');
  } else {
    console.log('[config] Amazon Web Services for resource storage in cloud... OK');
  }

  // smtpServer
  if (Meteor.settings.private.smtpServer === undefined || Meteor.settings.private.smtpServer === '') {
    console.log('[config WARNING] Mailgun SMTP server keys not configured.');
    console.log('[config FIX] Configure `private.smtpServer` on settings.json.');
  } else if (Meteor.settings.public.app.config.mailNotifications === true) {
    console.log('[config] Mailgun SMTP server for e-mail notificiations... OK');
  } else {
    console.log('[config] Mailgun SMTP server for e-mail notificiations.... DISABLED');
  }

  // Facebook
  if (Meteor.settings.private.API.facebook.appId === undefined || Meteor.settings.private.API.facebook.appId === '') {
    console.log('[config WARNING] Facebook API keys not configured.');
    console.log('[config FIX] Configure `private.API.facebook.appId` and `private.API.facebook.appSecret` on settings.json.');
  } else {
    console.log('[config] Facebook API key for identity login... OK');
  }

  // Twitter
  if (Meteor.settings.private.API.twitter.APIKey === undefined || Meteor.settings.private.API.twitter.APIKey === '') {
    console.log('[config WARNING] Twitter API keys not configured.');
    console.log('[config FIX] Configure `private.API.twitter.APIKey` and `private.API.twitter.APISecret` on settings.json.');
  } else {
    console.log('[config] Twitter API key for identity login... OK');
  }

  // Raven
  if (Meteor.settings.private.sentryPrivateDSN === undefined || Meteor.settings.private.sentryPrivateDSN === '' ||
      Meteor.settings.public.sentryPublicDSN === undefined || Meteor.settings.public.sentryPublicDSN === ''
  ) {
    console.log('[config WARNING] Sentry DSN keys not configured.');
    console.log('[config FIX] Configure `private.sentryPrivateDSN` and `public.sentryPublicDSN` on settings.json.');
  } else {
    console.log('[config] Sentry DSN keys... OK');
  }

  // Google
  if (Meteor.settings.public.analyticsSettings['Google Analytics'].trackingId === undefined || Meteor.settings.public.analyticsSettings['Google Analytics'].trackingId === '') {
    console.log('[config WARNING] Google Analytics tracking Id not configured.');
    console.log('[config FIX] Configure `public.analyticsSettings.Google Analytics.trackingId` on settings.json.');
  } else {
    console.log('[config] Google Analytics tracking Id... OK');
  }
});
