// IMPORTANT NOTE FOR NOVICE CHIMP USERS
// Tests that run in the Chimp context do not run in Meteor,
// they run outside Meteor and talk to the app, from a completely different node.js process.
// Hence, the following imports won't work but you can still access them in server.execute()
// import { Meteor } from 'meteor/meteor';
// import { Tags } from '/imports/api/tags/Tags';

import {log, fail, getServer} from './support/utils';


export default function () {

  this.getUser = (name) => {
    if (name == 'I' && this.I) { name = this.I; }
    return fixtures.users.findOneByName(name);
  };

  this.Given(/^I am the (?:newly created )?citizen named (.+)$/, (name) => {
    log(`Creating citizen '${name}'…`);
    const user = fixtures.users.create(name);
    if ( ! user) { fail('No user was returned after user creation.'); }

    log(`Logging in as '${name}'…`);
    fixtures.users.login(user.emails[0].address, name);

    this.I = name;
  });

  this.Given(/^there is a tag titled (.+)$/, (title) => {
    // todo: refactor using the (private!) createTag method in /imports/api/contracts/methods ? @santisiri
    const tag = getServer().execute((title) => {
      repository = require('/imports/api/tags/Tags').Tags;
      repository.insert({text: title});
      return repository.findOne({text: title});
    }, title);

    if ( ! tag) { fail('No tag was returned after tag creation.'); }
  });

  this.Given(/^(.+) has (\d+) votes available$/, (name, votes) => {
    const user = this.getUser(name);
    const wallet = user.profile.wallet;
    log(wallet);
    log(wallet.balance);
    log(wallet.placed);
    log(wallet.available);
    log(wallet.currency);
    // fixme

  });

  this.Then(/^(.+) should have (\d+) votes available$/, (name, votes) => {
    expect(this.getUser(name).profile.wallet.available).to.equal(votes);
  });

  this.Then(/^I dump the citizen (.+)$/, (name) => {
    log(this.getUser(name));
  });

};