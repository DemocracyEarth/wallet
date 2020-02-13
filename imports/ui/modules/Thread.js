import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import { Vote, updateState } from '/imports/ui/modules/Vote';
import { getDelegationContract } from '/imports/startup/both/modules/Contract';
import { transact, getVotes } from '/imports/api/transactions/transaction';
import { Contracts } from '/imports/api/contracts/Contracts';

import { guidGenerator } from '../../startup/both/modules/crypto';


let node = '';
let currentParent = '';

/**
* @summary - helper function to resolve path on searchTree
*/
const resolvePath = (uri) => {
  let path = [];
  path = uri.split('.');
  path.splice(-2, 2);
  // uri = path.toString().replace(/,/g, '.');
  return path.toString().replace(/,/g, '.');
};

/**
* @summary - searches the thread tree to locate the node that's being modified
* @param {object} element - object from `events` array
* @param {string} matchingTitle - title or id of element in subject
* @param {string} iterator
* @param {boolean} isRoot - indicates first parent or not
* @param {string} inheritedPath - indicates correct path for recurssion
* @param {string} target - what is being searched, '.children' (for postComment), '.sortTotal' (for voteComment)
*/
const searchTree = (element, matchingTitle, iterator, isRoot, inheritedPath, target) => {
  let parentStr;
  if (element.id === matchingTitle) {
    if (iterator !== undefined) {
      if (isRoot) {
        return `events.${iterator.toString()}${target}`;
      }
      parentStr = `.${iterator.toString()}${target}`;
      node += inheritedPath + parentStr;
      return node;
    }
  } else if (element.children !== undefined) {
    let i;
    let result = '';
    if (isRoot) {
      currentParent = 'events';
    }
    currentParent += `.${iterator.toString()}.children`;
    for (i = 0; result === '' && i < element.children.length; i += 1) {
      result = searchTree(element.children[i], matchingTitle, i, false, currentParent, target);
    }
    if (result === '') {
      currentParent = resolvePath(currentParent);
    }
    return result;
  }
  return '';
};

/**
* @summary posts a comment on a thread
* @param {string} contractId - contract where this comment goes.
* @param {object} eventObject - object containing the event info
* @param {string} replyId - if reply to another comment, id of such comment.
*/
const _postComment = (contractId, eventObj, replyId) => {
  let thread = [];
  const eventObject = eventObj;
  const query = {};
  if (replyId === undefined) {
    Contracts.update(contractId, { $push: { events: eventObject } });
  } else {
    // add event object dynamic key values since Schema is blackboxed to enable infinite branching.
    eventObject.timestamp = new Date();
    eventObject.status = 'NEW';
    eventObject.id = guidGenerator();
    thread = Contracts.find({ _id: Session.get('contract')._id }).fetch()[0].events;
    node = '';
    currentParent = '';
    for (const children in thread) {
      node += searchTree(thread[children], replyId, children, true, '', '.children');
    }
    query[node] = eventObject;
    Contracts.update(
      { _id: contractId },
      { $push: query }
    );
  }
};

/**
* @summary - upvotes or downvotes a comment
* @param {string} contractId - contract where this comment goes.
* @param {string} threadId - exact comment that is being up/down voted
* @param {string} vote - indicates where it's an upvote (1) or downvote (-1)
* @param {boolean} removal - removes the vote rather than adding one
*/
const _voteComment = (contractId, threadId, vote, removal) => {
  const thread = Contracts.find({ _id: contractId }).fetch()[0].events;
  const query = {};
  node = '';
  currentParent = '';
  for (const children in thread) {
    node += searchTree(thread[children], threadId, children, true, '', '.votes');
  }

  // build query
  query[node] = {
    quantity: vote,
    userId: Meteor.userId(),
  };

  if (removal === true) {
    Contracts.update(
      { _id: contractId },
      { $pull: query }
    );
  } else {
    // store vote in contract thread
    Contracts.update(
      { _id: contractId },
      { $push: query }
    );
  }
};

/**
* @summary instant upvote or downvote
* @param {string} wallet - wallet object to process
* @param {boolean} userId - user id duh
* @param {string} contractId - contract where this comment goes.
* @param {string} threadId - exact comment that is being up/down voted
* @param {boolean} negative downvote if true.
* @param {boolean} direct do a transact instead of a Vote.execute
* @param {boolean} removal if action is to remove a vote
*/
const _singleVote = (sourceId, targetId, contractId, threadId, quantity, direct, removal, settings, flip) => {
  let vote;
  let load = quantity;
  let success = false;
  if (!direct) {
    // vote
    vote = new Vote(Meteor.user().profile.wallet, targetId);
    vote.place(parseInt(vote.inBallot + load, 10), true);
    success = vote.execute();
    if (flip) { load *= -1; }
  } else {
    success = transact(sourceId, targetId, load, settings);
    updateState();
    if (flip) { load *= -1; }
  }
  // persist in thread
  if (success) { _voteComment(contractId, threadId, load, removal); }
};

/**
* @summary dispatches an upvote or downvote
* @param {boolean} up if up or down baby
* @param {object} thread specific thread object to edit on
* @param {string} contractId where are this votes stored
*/
const _thumbVote = (up, thread, contractId) => {
  let counterParty;
  let quantity;
  let hasDelegation = false;
  const settings = {
    condition: {
      transferable: true,
      portable: true,
      tags: [],
    },
    currency: 'VOTES',
    kind: 'DELEGATION',
  };
  if (!up) { quantity = -1; } else { quantity = 1; }

  const delegation = getDelegationContract(thread.userId, Meteor.userId());
  if (getVotes(delegation._id, Meteor.userId()) > 0) {
    counterParty = delegation._id;
    hasDelegation = true;
    settings.condition = _.pick(Object.assign(settings.condition, delegation), 'transferable', 'portable', 'tags');
  } else {
    settings.kind = 'DISCIPLINE';
    counterParty = Meteor.settings.public.Collective._id;
  }

  if (Meteor.user().profile.wallet.available > 0) {
    if (up) {
      if (!thread.userUpvoted && !thread.userDownvoted) {
        // new 1
        _singleVote(Meteor.userId(), thread.userId, contractId, thread.id, quantity, false, false, settings);
      } else if (thread.userUpvoted && !thread.userDownvoted) {
        // getback 1
        _singleVote(counterParty, Meteor.userId(), contractId, thread.id, quantity, true, true, settings);
      } else if (!thread.userUpvoted && thread.userDownvoted) {
        // getback -1 & new 1
        if (hasDelegation) {
          _singleVote(Meteor.userId(), thread.userId, contractId, thread.id, 1, false, true, settings, true);
          _singleVote(Meteor.userId(), thread.userId, contractId, thread.id, quantity, false, false, settings);
        } else {
          _singleVote(counterParty, thread.userId, contractId, thread.id, quantity, true, true, settings, true);
          _singleVote(Meteor.userId(), thread.userId, contractId, thread.id, quantity, false, false, settings);
        }
      }
    } else if (!up) {
      if (!thread.userDownvoted && thread.userUpvoted) {
        // getback 1 & new -1, can never not have a delegation
        if (hasDelegation) {
          _singleVote(counterParty, Meteor.userId(), contractId, thread.id, 1, true, true, settings);
          _singleVote(Meteor.userId(), thread.userId, contractId, thread.id, quantity, false, false, settings);
        }
      } else if (!thread.userDownvoted && !thread.userUpvoted) {
        // new -1
        if (hasDelegation) {
          _singleVote(Meteor.userId(), thread.userId, contractId, thread.id, quantity, false, false, settings);
        } else {
          _singleVote(thread.userId, counterParty, contractId, thread.id, quantity, true, false, settings);
        }
      } else if (thread.userDownvoted && !thread.userUpvoted) {
        // getback -1
        if (hasDelegation) {
          _singleVote(Meteor.userId(), thread.userId, contractId, thread.id, 1, false, true, settings, true);
        } else {
          _singleVote(counterParty, thread.userId, contractId, thread.id, quantity, true, true, settings);
        }
      }
    }
  }
};

/**
* @summary cancels upvote/downvote to comment
* @param {string} contractId - contract where this comment goes.
* @param {string} threadId - exact comment that is being up/down voted
* @param {number} vote unit positive or negative
*/
const _cancelVote = (contractId, threadId, vote) => {
  _voteComment(contractId, threadId, vote, true);
};

export const singleVote = _singleVote;
export const cancelVote = _cancelVote;
export const thumbVote = _thumbVote;
export const voteComment = _voteComment;
export const postComment = _postComment;
