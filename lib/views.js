import { Meteor } from 'meteor/meteor';

import { gui } from '/lib/const';

const _views = {};

_views.latest = (terms) => {
  return {
    find: { collectiveId: Meteor.settings.public.Collective._id, stage: { $ne: 'DRAFT' } },
    options: { sort: { createdAt: -1 }, limit: terms.limit, skip: terms.skip },
  };
};

// TODO: this is an example for reference.
_views.popular = (terms) => {
  return {
    find: {},
    options: { sort: { score: -1 }, limit: terms.limit, skip: terms.skip },
  };
};

/**
* @summary creates a query for a publication
* @param {object} terms includes settings to create the db query
*/
const _query = (terms) => {
  const viewFunction = _views[terms.view];
  const parameters = viewFunction(terms);

  if (parameters.limit > gui.ITEMS_PER_PAGE) {
    parameters.limit = gui.ITEMS_PER_PAGE;
  }

  return parameters;
};

export const views = _views;
export const query = _query;
