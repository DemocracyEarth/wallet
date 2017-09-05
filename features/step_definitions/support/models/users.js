import {fail, getServer} from "../utils";

models.users = {
  findByName(name) {
    const user = getServer().execute((name) => {
      const slug = require('/lib/utils').convertToSlug(name).replace(/-+/, ''); // ouch
      return require('meteor/accounts-base').Accounts.findUserByUsername(slug);
    }, name);

    return user;
  },

  findOneByName(name) {
    const user = models.users.findByName(name);
    if ( ! user) { fail(`Unable to find the user '${name}'.`); }

    return user;
  },
};