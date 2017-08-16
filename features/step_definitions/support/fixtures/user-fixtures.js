import {log, fail, getBrowser, getServer} from '../utils';


fixtures.users = {

  create(name) {
    return getServer().execute((name) => {
      const slug = require('/lib/utils').convertToSlug(name);
      return Meteor.users.findOne(Accounts.createUser({
        email: slug + '@democracy.earth',
        username: slug,
        password: name,
        // fixme: profile is ignored, for some reason
        profile: {firstName: name, lastName: 'The Tester'},
      }));
    }, name);
  },

  serverLogin(email, password) {
    getServer().call('login', {user: {email: email}, password: password});
  },

  clientLogin(email, password) {
    getBrowser().timeoutsAsyncScript(2000);
    const returned = getBrowser().executeAsync((email, password, done) => {
      //console.log("I am printed in the browser's developer console.");
      Meteor.loginWithPassword(email, password, (err) => { done(err); });
    }, email, password);

    if (returned && returned.value) {
      fail(`There was an error with the Meteor login : ${returned.value.message}.`);
    }
  },

  login(email, password) {
    this.serverLogin(email, password);
    this.clientLogin(email, password);
  },
};