import {getServer, getBrowser, visit, fail} from '../utils';


fixtures.common = {
  reset() {
    getServer().call('logout');
    visit('/'); // browser.execute below NEEDS this
    getBrowser().execute(() => Meteor.logout());
    getServer().execute(() => Package['xolvio:cleaner'].resetDatabase());
    getServer().execute(() => { // Basically a copy of what's in Meteor.startup() -- todo: refacto needed there
      const Collectives = require('/imports/api/collectives/Collectives').Collectives;
      Collectives.insert(Meteor.settings.public.Collective, (e, id) => {
        if (e) throw new Error("Could not add main collective to database. " + e);
        if (id) {
          const collective = Collectives.findOne({_id: id});
          if ( ! collective) { fail(`No collective found in database for collective '${id}'.`); }
          Meteor.settings.public.Collective._id = collective._id;
        } else {
          throw new Error("No id returned after adding main collective to database.");
        }
      });
    });

  },
};