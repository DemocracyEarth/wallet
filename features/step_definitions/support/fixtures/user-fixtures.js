import { getBrowser } from '../browser';



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
        server.call('login', { user: { email: email }, password: password });
    },

    clientLogin(email, password) {
        getBrowser().execute((email, password, done) => {
            //console.log("I am printed in the browser's developer console.");
            Meteor.loginWithPassword(email, password, done);
            // note: async/wait does not work in here, no idea why
        }, email, password);

        // There has got to be a better way to wait for meteor login to complete.
        // I tried async/wait, and flavors of the `done` callback. Nothing stuck.
        getBrowser().pause(1000);
    },

    login(email, password) {
        this.serverLogin(email, password);
        this.clientLogin(email, password);
    },
};