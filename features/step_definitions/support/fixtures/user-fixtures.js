import {log, fail, getBrowser, getServer} from '../utils';

fixtures.users = {

  create(name) {
    return getServer().execute((name) => {
      const slug = require('/lib/utils').convertToSlug(name).replace(/-+/, ''); // argh

      const user = Meteor.users.findOne(Accounts.createUser({
        email: slug + '@democracy.earth',
        username: slug,
        password: name,
        profile: {firstName: name, lastName: '(Tester)'},
      }));

      // no need or this anymore, but it's a nice snippet, maybe to set email as validated ?
      // Meteor.users.update(user, { $set: { 'profile.firstName': name }});

      require('/imports/api/transactions/transaction').genesisTransaction(user._id);

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
    getBrowser().timeouts('script', 2000);
    const returned = getBrowser().executeAsync((email, password, done) => {
      //console.log("I am printed in the browser's developer console.");
      Meteor.loginWithPassword(email, password, (err) => { done(err); });
    }, email, password);

    if (returned && returned.value) {
      fail(`There was an error with the Meteor login : ${returned.value.message}.`);
    }
  },

};