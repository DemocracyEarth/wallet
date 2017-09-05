// IMPORTANT NOTE FOR NOVICE CHIMP USERS
// Tests that run in the Chimp context do not run in Meteor,
// they run outside Meteor and talk to the app, from a completely different node.js process.
// Hence, the following imports won't work but you can still access them in server.execute()
// import { Meteor } from 'meteor/meteor';
// import { Tags } from '/imports/api/tags/Tags';

import {log, fail, getServer, getUser} from './support/utils';


export default function () {

  this.Given(/^I am the (?:newly created )?citizen named (.+)$/, (name) => {
    log(`Creating citizen '${name}'…`);
    const user = fixtures.users.create(name);
    if ( ! user) { fail('No user was returned after user creation.'); }

    log(`Logging in as '${name}'…`);
    fixtures.users.login(user.emails[0].address, name);

    context.I = name;
  });

  this.Given(/^I log in as (.+)$/, (name) => {
    const user = getUser(name);

    log(`Logging in as '${name}'…`);
    fixtures.users.login(user.emails[0].address, name);

    context.I = name;
  });

  this.Given(/^there is a citizen named (.+)$/, (name) => {
    log(`Creating citizen '${name}'…`);
    const user = fixtures.users.create(name);
    if ( ! user) { fail('No user was returned after user creation.'); }
  });

  this.Given(/^(.+) has (\d+) votes available$/, (name, votes) => {
    const user = getUser(name);
    const wallet = user.profile.wallet;
    log(wallet);
    // how to do this ? Make a transaction with the Collective ?
    return 'pending';
  });

};