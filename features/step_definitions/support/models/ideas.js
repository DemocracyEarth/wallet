import {log, fail, getBrowser, getServer} from '../utils';

models.ideas = {

  find(query) {
    return getServer().execute((query) => {
      return require('/imports/api/contracts/Contracts').Contracts.find(query).fetch();
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