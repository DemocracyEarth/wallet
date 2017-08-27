import {log, fail, getBrowser, getServer} from '../utils';

fixtures.users = {

  /* note: this is synchronous */
  create(name) {
    return getServer().execute((name) => {
      const slug = require('/lib/utils').convertToSlug(name).replace(/-+/, '');

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

  /* failing ; using createUser from server is ... a puzzle. Promises can't be serialized apparently. */
  createWithServer(name) {
    return getServer().execute((name) => {
      const slug = require('/lib/utils').convertToSlug(name).replace(/-+/, '');

      const returned = require('/imports/startup/both/modules/User.js').createUser({
        email: slug + '@democracy.earth',
        username: slug,
        password: name,
        mismatchPassword: name,
      });
      if ( ! returned) { throw new Error("User creation with createUser failed."); }

      return returned;
    }, name);
  },

  /* failing ; using createUser from browser fails to write to the profile because of security measures */
  createWithBrowser(name) {
    let slug = getServer().execute((name) => {
      return require('/lib/utils').convertToSlug(name).replace(/-+/, '');
    }, name);

    getBrowser().timeoutsAsyncScript(3000);
    const thing = getBrowser().executeAsync((name, slug, done) => {

      const returned = require('/imports/startup/both/modules/User.js').createUser({
        email: slug + '@democracy.earth',
        username: slug,
        password: name,
        mismatchPassword: name,
      });
      if ( ! returned) { throw new Error("User creation with createUser failed."); }

      returned.then((u) => {done(u)});
      // executeAsync cannot return an Error, instead we get {}, so we wrap it ourselves
      returned.catch((e) => {done({error: e.message})});

    }, name, slug);

    if (thing.value.error) { throw Error(thing.value.error); }

    // Interesting. executeAsync cannot return an Error, instead we get {}
    //if (thing.value instanceof Error) throw thing.value;

    const user = getServer().execute((slug) => {
      return Meteor.users.findOne({username: slug}); // use findOneByUsername instead
    }, slug);

    if ( ! user.profile) { fail(`No profile for user '${slug}' right after creation.`); }
    if ( ! user) { fail(`No user '${slug}' in the database right after creation.`); }

    return user;
  },

  login(email, password) {
    this.serverLogin(email, password);
    this.clientLogin(email, password);
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

  findByName(name) {
    const user = getServer().execute((name) => {
      const slug = require('/lib/utils').convertToSlug(name).replace(/-+/, '');
      return require('meteor/accounts-base').Accounts.findUserByUsername(slug);
    }, name);
    return user;
  },

  findOneByName(name) {
    const user = fixtures.users.findByName(name);
    if ( ! user) { fail(`Unable to find the user '${name}'.`); }
    return user;
  },

};