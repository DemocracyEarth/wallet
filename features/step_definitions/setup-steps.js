
// IMPORTANT NOTE FOR NOVICE CHIMP USERS
// Tests that run in the Chimp context do not run in Meteor,
// they run outside Meteor and talk to the app, from a completely different node.js process.
// Hence, the following imports won't work but you can still access them in server.execute()
// import { Meteor } from 'meteor/meteor';
// import { Tags } from '/imports/api/tags/Tags';

import { log, fail, getServer } from './support/utils';
import { getBrowser } from './support/browser';


// module.exports = function() { // Chimp suggests using that
export default function () {

    this.Given(/^I am the citizen named (.+)$/, (name) => {
        log(`Creating citizen '${name}'.`);

        const server = getServer(),
              browser = getBrowser();

        // Implicitly (but synchronously!) create a citizen
        const user = server.execute((name) => {
            const slug = require('/lib/utils').convertToSlug(name);
            return Meteor.users.findOne(Accounts.createUser({
                email: slug+'@democracy.earth',
                username: slug,
                password: name,
                // fixme: profile is ignored, for some reason
                profile: { firstName: name, lastName: 'The Tester' },
            }));
        }, name);

        if ( ! user) { fail('No user was returned after user creation.'); }

        fixtures.users.login(user.emails[0].address, name);

    });

    this.Given(/^there is a tag titled (.+)$/, (title) => {
        // todo: refactor using the (private!) createTag method in /imports/api/contracts/methods ?
        const tag = getServer().execute((title) => {
            repository = require('/imports/api/tags/Tags').Tags;
            repository.insert({ text: title });
            return repository.findOne({ text: title });
        }, title);

        if ( ! tag) {
            throw new Error('No tag was returned after tag creation.');
        }
    });

};