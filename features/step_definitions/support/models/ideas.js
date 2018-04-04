import {log, fail, getBrowser, getServer} from '../utils';

models.ideas = {

  find(query) {
    if (typeof query === 'undefined') query = {};  // sad but needed fix
    return getServer().execute((query) => {
      return require('/imports/api/contracts/Contracts').Contracts.find(query).fetch();
    }, query);
  },

  findOne(query) {
    if (typeof query === 'undefined') throw new Error("findOne() requires a query object.");
    return getServer().execute((query) => {
      return require('/imports/api/contracts/Contracts').Contracts.findOne(query);
    }, query);
  },

  findByTitle(title) {
    return models.ideas.find({'title': title});
  },

  findOneByTitle (title) {
    const ideas = models.ideas.findByTitle(title);

    if (1 > ideas.length) { fail(`No idea found with "${title}".`); }
    if (1 < ideas.length) { fail(`Ambiguity ! Too many ideas found with title "${title}".`); }

    return ideas[0];
  },

};