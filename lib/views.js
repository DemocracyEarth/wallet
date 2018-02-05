import { Meteor } from 'meteor/meteor';

import { gui } from '/lib/const';

const _views = {};

_views.latest = (terms) => {
  return {
    find: { collectiveId: Meteor.settings.public.Collective._id, stage: { $ne: 'DRAFT' }, kind: { $ne: 'DELEGATION' } },
    options: { sort: { lastUpdate: -1 }, limit: terms.limit, skip: terms.skip },
  };
};

_views.peer = (terms) => {
  return {
    find: { collectiveId: Meteor.settings.public.Collective._id, stage: { $ne: 'DRAFT' }, signatures: { $elemMatch: { username: terms.username } } },
    options: { sort: { lastUpdate: -1 }, limit: terms.limit, skip: terms.skip },
  };
};

_views.tag = (terms) => {
  return {
    find: { collectiveId: Meteor.settings.public.Collective._id, stage: { $ne: 'DRAFT' }, title: { $regex: `.*/tag/${terms.tag}.*` } },
    options: { sort: { lastUpdate: -1 }, limit: terms.limit, skip: terms.skip },
  };
};

_views.contract = (terms) => {
  if (Meteor.user()) {
    return {
      find: { _id: terms.contractId },
      options: {},
    };
  }
  return undefined;
};

_views.contractByKeyword = (terms) => {
  if (Meteor.user()) {
    return {
      find: { keyword: terms.keyword },
      options: {},
    };
  }
  return undefined;
};

_views.delegationContracts = () => {
  if (Meteor.user()) {
    return {
      find: { $and: [{ signatures: { $elemMatch: { username: Meteor.user().username } } }, { kind: 'DELEGATION' }] },
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

_views.delegationTransactions = (terms) => {
  const query = [];
  for (const i in terms.items) {
    query.push({ $and: [{ 'output.entityId': terms.items[i] }, { kind: 'DELEGATION' }] });
    query.push({ $and: [{ 'input.entityId': terms.items[i] }, { kind: 'DELEGATION' }] });
  }
  return {
    find: { $or: query },
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
    find: { $or: [{ 'output.entityId': terms.contractId }, { 'input.entityId': terms.contractId }] },
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
