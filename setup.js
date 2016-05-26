//This script runs the first time Democracy Earth gets implemented on a server.
console.log('Loading ' + Meteor.settings.public.app.name + ' version: ' + Meteor.settings.public.app.version + ' codename: ' + Meteor.settings.public.app.codename );

if (Meteor.isServer) {
  console.log('Verifiying main Collective in server...');
  var dbCollective = Collective.findOne({ domain: Meteor.settings.public.Collective.domain });

  if (!dbCollective) {

      console.log('Main Collective ready with id ' + dbCollective._id);
      console.log("Verifying object: " + Meteor.settings.public.Collective.votes);

      if (Match.test(Meteor.settings.public.Collective.votes, Schema.Votes)) {
        console.log('Updating DB...')
        Collective.update({ _id: dbCollective._id }, { $set : {
          votes: Meteor.settings.public.Collective.votes
        }}, function (error, result) {
          if ( error ) console.log ( "-- ERROR: Could not add main collective to database. " + error );
          if ( result ) console.log ( "SUCCESS: Main collective set up with id " + result );
        });
      }

  } else {

    //Organization has no Collective in db yet
    console.log('Installing democracy in server...');

    if (Meteor.settings.public.Collective == undefined) {
      console.log('-- MISSING SETTING: Collective was not found. Please setup settings.json on config/development')
    } else {
      console.log('Setting up main Collective in database...');
      Collective.insert(Meteor.settings.public.Collective, function( error, result) {
          if ( error ) console.log ( "-- ERROR: Could not add main collective to database. " + error );
          if ( result ) console.log ( "SUCCESS: Main collective set up with id " + result );
        }
      );
    }

  }
}
