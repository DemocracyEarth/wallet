import {log, fail, getBrowser, getServer} from '../utils';

models.ideas = {

  // We need to filter out drafts since the system automatically creates an idea draft upon user creation.
  // See https://github.com/DemocracyEarth/sovereign/pull/220#issuecomment-378731546
  filterQueryRemoveDrafts(query) {
    if ( ! query['stage']) {
      query['stage'] = {'$ne': 'DRAFT'};
    }
    return query;
  },

  filterQueryOnlyDrafts(query) {
    if ( ! query['stage']) {
      query['stage'] = 'DRAFT';
    }
    return query;
  },

  find(query) {
    if (typeof query === 'undefined') query = {};
    query = models.ideas.filterQueryRemoveDrafts(query);
    return getServer().execute((query) => {
      return require('/imports/api/contracts/Contracts').Contracts.find(query).fetch();
    }, query);
  },

  findDrafts(query) {
    if (typeof query === 'undefined') query = {};
    query = models.ideas.filterQueryOnlyDrafts(query);
    return models.ideas.find(query);
  },

  findOne(query) {
    if (typeof query === 'undefined') throw new Error("findOne() requires a query object.");
    query = models.ideas.filterQueryRemoveDrafts(query);
    return getServer().execute((query) => {
      return require('/imports/api/contracts/Contracts').Contracts.findOne(query);
    }, query);
  },

  findOneDraft(query) {
    if (typeof query === 'undefined') query = {};
    query = models.ideas.filterQueryOnlyDrafts(query);
    return models.ideas.findOne(query);
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