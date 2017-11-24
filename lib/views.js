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

_views.delegationContracts = () => {
  return {
    find: { signatures: { $elemMatch: { username: Meteor.user().username } } },
    options: {},
  };
};

_views.userTransactions = () => {
  return {
    find: { $or: [{ 'output.entityId': Meteor.userId() }, { 'input.entityId': Meteor.userId() }] },
    options: {},
  };
};

_views.delegations = () => {
  return {
    find: { kind: 'DELEGATION' },
    options: {},
  };
};

_views.singleVote = (terms) => {
  return {
    find: { $or: [{ $and: [{ 'output.entityId': Meteor.userId() }, { 'input.entityId': terms.contractId }] },
                  { $and: [{ 'input.entityId': Meteor.userId() }, { 'output.entityId': terms.contractId }] }] },
    options: {},
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
