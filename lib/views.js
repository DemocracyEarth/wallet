import { Meteor } from 'meteor/meteor';
import { Contracts } from '/imports/api/contracts/Contracts';

import { createDelegation } from '/imports/startup/both/modules/Contract';
import { gui, defaultSettings } from '/lib/const';
import { convertToSlug } from '/lib/utils';

const _views = {};

_views.latest = (terms) => {
  return {
    find: { collectiveId: Meteor.settings.public.Collective._id, stage: { $ne: 'DRAFT' }, kind: { $ne: 'DELEGATION' } },
    options: { sort: { lastUpdate: -1 }, limit: terms.limit, skip: terms.skip },
  };
};

_views.peer = (terms) => {
  return {
    find: { collectiveId: Meteor.settings.public.Collective._id, stage: { $ne: 'DRAFT' }, signatures: { $elemMatch: { _id: terms.userId } } },
    options: { sort: { lastUpdate: -1 }, limit: terms.limit, skip: terms.skip },
  };
};

_views.post = (terms) => {
  return {
    find: { collectiveId: Meteor.settings.public.Collective._id, stage: { $ne: 'DRAFT' }, keyword: terms.keyword },
    options: { sort: { lastUpdate: -1 } },
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
      find: { $and: [{ signatures: { $elemMatch: { _id: Meteor.userId() } } }, { kind: 'DELEGATION' }] },
      options: {},
    };
  }
  return undefined;
};

_views.bothDelegationContracts = (terms) => {
  if (Meteor.user()) {
    const query = { $and: [{ signatures: { $elemMatch: { _id: Meteor.userId() } } }, { signatures: { $elemMatch: { _id: terms.delegateId } } }, { kind: 'DELEGATION' }] };
    if (Contracts.find(query).fetch().length === 0) {
      console.log(`{ view: 'bothDelegationContracts', user: ${Meteor.user().username}, delegateId: ${terms.delegateId}, `);
      const delegateName = Meteor.users.findOne({ _id: terms.delegateId }).username;

      defaultSettings.delegations.title = `${convertToSlug(Meteor.user().username)}-${convertToSlug(delegateName)}`;
      defaultSettings.delegations.signatures = [{ username: Meteor.user().username }, { username: delegateName }];
      createDelegation(Meteor.userId(), terms.delegateId, defaultSettings.delegations);
      console.log(`log: 'Delegation contract created from ${Meteor.user().username} to ${delegateName}', `);

      defaultSettings.delegations.title = `${convertToSlug(delegateName)}-${convertToSlug(Meteor.user().username)}`;
      defaultSettings.delegations.signatures = [{ username: delegateName }, { username: Meteor.user().username }];
      createDelegation(terms.delegateId, Meteor.userId(), defaultSettings.delegations);
      console.log(`log: 'Delegation contract created from ${delegateName} to ${Meteor.user().username}' }`);
    }
    return {
      find: query,
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
    query.push({ $and: [{ 'output.delegateId': terms.items[i] }, { kind: 'DELEGATION' }] });
    query.push({ $and: [{ 'input.delegateId': terms.items[i] }, { kind: 'DELEGATION' }] });
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
