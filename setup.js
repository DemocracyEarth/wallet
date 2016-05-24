//This script runs the first time Democracy Earth gets implemented on a server.

if (Meteor.isServer) {

  //Organization has no Collective in db yet
  if (Collective.find({}).fetch().length == 0) {

    console.log('Installing democracy in server...');
    console.log('Setting up node owner Collective in database...');

    if (Meteor.settings.Collective == undefined) {
      console.log('-- MISSING SETTING: Collective was not found. Please setup settings.json on config/development')
    } else {
      
    }

  }

};
