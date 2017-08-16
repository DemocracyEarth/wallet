// IMPORTANT NOTE FOR NOVICE CHIMP USERS
// Tests that run in the Chimp context do not run in Meteor,
// they run outside Meteor and talk to the app, from a completely different node.js process.
// Hence, the following imports won't work but you can still access them in server.execute()
// import { Meteor } from 'meteor/meteor';
// import { Tags } from '/imports/api/tags/Tags';

import {log, fail, getServer} from './support/utils';


// module.exports = function() { // Chimp suggests using that
export default function () {

  this.Given(/^I am the citizen named (.+)$/, (name) => {
    log(`Creating citizen '${name}'…`);
    const user = fixtures.users.create(name);

    if ( ! user) { fail('No user was returned after user creation.'); }

    log(`Logging in as '${name}'…`);
    fixtures.users.login(user.emails[0].address, name);
  });

  this.Given(/^there is a tag titled (.+)$/, (title) => {
    // todo: refactor using the (private!) createTag method in /imports/api/contracts/methods ?
    const tag = getServer().execute((title) => {
      repository = require('/imports/api/tags/Tags').Tags;
      repository.insert({text: title});
      return repository.findOne({text: title});
    }, title);

    if ( ! tag) { fail('No tag was returned after tag creation.'); }
  });

};