//This script runs the first time Democracy Earth gets implemented on a server.
console.log(Meteor.settings.public.app.name + ' version: ' + Meteor.settings.public.app.version + ' codename: ' + Meteor.settings.public.app.codename );

if (Meteor.isServer) {
  console.log('Verifiying main Collective in server...');
  var dbCollective = Collectives.findOne({ domain: Meteor.settings.public.Collective.domain });

  if (dbCollective) {
      setupCollectiveInApp(dbCollective);
  } else {
    //Organization has no Collective in db yet
    console.log('Installing democracy in server...');
    if (Meteor.settings.public.Collective == undefined) {
      console.log('-- MISSING SETTING: Collective was not found. Please setup settings.json on config/development.')
    } else {
      console.log('Setting up main Collective in database...');
      Collectives.insert(Meteor.settings.public.Collective, function( error, result) {
          if ( error ) console.log ( "-- ERROR: Could not add main collective to database. " + error );
          if ( result ) {
            console.log ( "SUCCESS: Main collective set up with id " + result );
            setupCollectiveInApp( Collectives.findOne({ domain: Meteor.settings.public.Collective.domain }));
          }
        }
      );
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

  //Google Analytics
  if (Meteor.settings.public.analyticsSettings["Google Analytics"].trackingId == undefined || Meteor.settings.public.analyticsSettings["Google Analytics"].trackingId == "") {
    console.log('-- MISSING SETTING: Google Analytics tracking ID not configured.');
    console.log('-- FIX: Configure `public.analyticsSettings["Google Analytics"].trackingId` on settings.json.');
  } else {
    console.log('Google Analytics tracking ID... OK');
  }

  //Kadira
  if (Meteor.settings.kadira.appId == undefined || Meteor.settings.kadira.appId == "") {
    console.log('-- MISSING SETTING: Kadira keys for performance app testing not configured.');
    console.log('-- FIX: Configure `kadira.appId` and `kadira.appSecret` on settings.json.');
  } else {
    console.log('Kadira keys for performance app testing... OK');
  }
}

function setupCollectiveInApp (collective) {
  Meteor.settings.public.Collective._id = collective._id;
  console.log('This server is being run by collective ' + collective.name);
  console.log('The collective can be reached with id ' + collective._id);
}
