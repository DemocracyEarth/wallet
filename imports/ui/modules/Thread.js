import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import { Vote } from '/imports/ui/modules/Vote';
import { getDelegationContract } from '/imports/startup/both/modules/Contract';
import { transact } from '/imports/api/transactions/transaction';

import { guidGenerator } from '../../startup/both/modules/crypto';
import { Contracts } from '../../api/contracts/Contracts';

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
* @param {boolean} undo remove a vote if true.
*/
const _singleVote = (sourceId, targetId, contractId, threadId, negative, undo) => {
  let quantity;
  let vote;
  let execute;
  const settings = {
    condition: {
      transferable: true,
      portable: true,
      tags: [],
    },
    currency: 'VOTES',
    kind: 'DELEGATION',
  };
  if (!undo) {
    vote = new Vote(Meteor.user().profile.wallet, targetId);
    if (negative) { quantity = -1; } else { quantity = 1; }
    vote.place(parseInt(vote.inBallot + quantity, 10), true);
    execute = vote.execute();
  } else {
    const delegation = getDelegationContract(sourceId, targetId);
    settings.contractId = delegation._id;
    execute = transact(delegation._id, targetId, 1, settings);
  }
  if (execute) {
    if (!undo) {
      _voteComment(contractId, threadId, quantity);
    } else {
      _voteComment(contractId, threadId, quantity, true);
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
export const voteComment = _voteComment;
export const postComment = _postComment;
