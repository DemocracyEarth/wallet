import { getServer, getBrowser, visit } from '../utils';


fixtures.common = {
    reset() {
        getServer().call('logout');
        visit('/'); // browser.execute below NEEDS this
        getBrowser().execute(() => Meteor.logout());
        getServer().execute(() => Package['xolvio:cleaner'].resetDatabase());
    },
};