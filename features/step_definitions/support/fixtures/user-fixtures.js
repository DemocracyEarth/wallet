import {log, fail, getBrowser, getServer} from '../utils';


fixtures.users = {

  // create() {
  //     server.execute(() => {
  //         const email = 'test@example.com';
  //         const password = 'jkjkjkjk';
  //         let userId;
  //         try {
  //             const user = Meteor.users.findOne({ emails: { $elemMatch: { address: email } } });
  //             userId = user._id;
  //         } catch (e) {
  //             userId = Accounts.createUser({
  //                 username: 'test',
  //                 email,
  //                 password,
  //                 profile: { firstName: 'Tim', lastName: 'Fletcher' },
  //             });
  //         }
  //         // Always reset user password as a test may have changed it
  //         Accounts.setPassword(userId, password, { logout: false });
  //     });
  // },

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