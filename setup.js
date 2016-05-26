//This script runs the first time Democracy Earth gets implemented on a server.
console.log('Loading ' + Meteor.settings.public.app.name + ' version: ' + Meteor.settings.public.app.version + ' codename: ' + Meteor.settings.public.app.codename );

if (Meteor.isServer) {
  console.log('Verifiying main Collective in server...');
  var dbCollective = Collectives.findOne({ domain: Meteor.settings.public.Collective.domain });

  if (dbCollective) {

      console.log('Main Collective ready with id ' + dbCollective._id);

  } else {

    //Organization has no Collective in db yet
    console.log('Installing democracy in server...');

    if (Meteor.settings.public.Collective == undefined) {
      console.log('-- MISSING SETTING: Collective was not found. Please setup settings.json on config/development')
    } else {
      console.log('Setting up main Collective in database...');
      Collectives.insert(Meteor.settings.public.Collective, function( error, result) {
          if ( error ) console.log ( "-- ERROR: Could not add main collective to database. " + error );
          if ( result ) console.log ( "SUCCESS: Main collective set up with id " + result );
        }
      );
    }
  }
}
