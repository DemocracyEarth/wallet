import {log, fail, getBrowser, getServer} from '../utils';

fixtures.users = {

  // Create a user from inside the blackbox. This should be as terse (DRY) as possible.
  // Blackbox user creation has advantages over registration through interface :
  // - should be faster
  // - less side effects client-side (automatic login, etc.)
  // and drawbacks :
  // - requires strict factorization to keep things DRY
  // - no side-effects (sometimes we want them)
  create(name) {
    return getServer().execute((name) => {
      const username = require('/lib/utils').convertToUsername(name);

      // Instead of Accounts.createUser, here we should call _one_ method that handles everything
      const user = Meteor.users.findOne(Accounts.createUser({
        email: username + '@democracy.earth',
        username: username,
        password: name,
        profile: {firstName: name, lastName: '(Tester)'},
      }));

      // No need or this anymore, but it's a nice snippet, maybe to set email as validated ?
      // Meteor.users.update(user, { $set: { 'profile.firstName': name }});

      // We don't do the genesis anymore (but maybe we should)
      // require('/imports/api/transactions/transaction').genesisTransaction(user._id);

      // Meteor.call('subsidizeUser', (subsidyError) => {
      //   if (subsidyError) {
      //     log("/!. Subsidy Error: " + subsidyError.reason);
      //   }
      // });

      return user;
    }, name);
  },

  login(email, password) {
    this.serverLogin(email, password);
    this.clientLogin(email, password);
  },

  serverLogin(email, password) {
    getServer().call('login', {user: {email: email}, password: password});
  },

  clientLogin(email, password) {
    getBrowser().timeouts('script', 15000);
    const returned = getBrowser().executeAsync((email, password, done) => {
      //console.log("I am printed in the browser's developer console.");
      Meteor.loginWithPassword(email, password, (err) => { done(err); });
    }, email, password);

    if (returned && returned.value) {
      fail(`There was an error with the Meteor login : ${returned.value.message}.`);
    }
  },

};