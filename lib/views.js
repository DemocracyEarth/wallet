import { Meteor } from 'meteor/meteor';

import { gui } from '/lib/const';

const _views = {};

_views.latest = (terms) => {
  return {
    find: { collectiveId: Meteor.settings.public.Collective._id, stage: { $ne: 'DRAFT' }, kind: { $ne: 'DELEGATION' } },
    options: { sort: { createdAt: -1 }, limit: terms.limit, skip: terms.skip },
  };
};

_views.peer = (terms) => {
  return {
    find: { collectiveId: Meteor.settings.public.Collective._id, stage: { $ne: 'DRAFT' }, signatures: { $elemMatch: { username: terms.username } } },
    options: { sort: { createdAt: -1 }, limit: terms.limit, skip: terms.skip },
  };
};

_views.delegationContracts = () => {
  if (Meteor.user()) {
    return {
      find: { signatures: { $elemMatch: { username: Meteor.user().username } } },
      options: {},
    };
  }
  return undefined;
};

_views.userTransactions = () => {
  return {
    find: { $or: [{ 'output.entityId': Meteor.userId() }, { 'input.entityId': Meteor.userId() }] },
    options: {},
  };
};

_views.delegations = () => {
  return {
    find: { $or: [{ $and: [{ 'output.entityId': Meteor.userId() }, { kind: 'DELEGATION' }] },
                  { $and: [{ 'input.entityId': Meteor.userId() }, { kind: 'DELEGATION' }] }] },
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

_views.contractVotes = (terms) => {
  return {
    // TODO: replace find
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

  if (parameters) {
    if (parameters.limit > gui.ITEMS_PER_PAGE) {
      parameters.limit = gui.ITEMS_PER_PAGE;
    }

    return parameters;
  }
  return undefined;
};

export const views = _views;
export const query = _query;
