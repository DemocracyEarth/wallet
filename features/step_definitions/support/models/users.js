import {fail, getServer} from "../utils";

models.users = {
  findByName(name) {
    const user = getServer().execute((name) => {
      const username = require('/lib/utils').convertToUsername(name);
      return require('meteor/accounts-base').Accounts.findUserByUsername(username);
    }, name);

    return user;
  },

  findOneByName(name) {
    const user = models.users.findByName(name);
    if ( ! user) { fail(`Unable to find the user '${name}'.`); }

    return user;
  },
};