import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import { guidGenerator } from '../../startup/both/modules/crypto';
import { Contracts } from '../../api/contracts/Contracts';
import { transact } from '../../api/transactions/transaction';

let node = '';
let currentParent = '';


/**
/* @summary - helper function to resolve path on searchTree
*/
const resolvePath = (uri) => {
  let path = [];
  path = uri.split('.');
  path.splice(-2, 2);
  // uri = path.toString().replace(/,/g, '.');
  return path.toString().replace(/,/g, '.');
};

/**
/* @summary - searches the thread tree to locate the node that's being modified
/* @param {object} element - object from `events` array
/* @param {string} matchingTitle - title or id of element in subject
/* @param {string} iterator
/* @param {boolean} isRoot - indicates first parent or not
/* @param {string} inheritedPath - indicates correct path for recurssion
/* @param {string} target - what is being searched, '.children' (for postComment),
                          '.sortTotal' (for voteComment)
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
/* @summary posts a comment on a thread
/* @param {string} contractId - contract where this comment goes.
/* @param {object} eventObject - object containing the event info
/* @param {string} replyId - if reply to another comment, id of such comment.
*/
export const postComment = (contractId, eventObj, replyId) => {
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
    console.log('replyId: ', replyId);
    console.log('thread: ', thread);
    node = '';
    currentParent = '';
    for (const children in thread) {
      node += searchTree(thread[children], replyId, children, true, '', '.children');
      console.log('node: ', node);
    }
    query[node] = eventObject;
    console.log('query: ', query);
    Contracts.update(
      { _id: contractId },
      { $push: query }
    );
  }
};

/**
/* @summary - upvotes or downvotes a comment
/* @param {string} contractId - contract where this comment goes.
/* @param {string} threadId - exact comment that is being up/down voted
/* @param {string} vote - indicates where it's an upvote (1) or downvote (-1)
*/
export const voteComment = (contractId, threadId, vote) => {
  console.log('voteComment()');
  const thread = Contracts.find({ _id: contractId }).fetch()[0].events;
  const query = {};
  node = '';
  currentParent = '';
  for (const children in thread) {
    node += searchTree(thread[children], threadId, children, true, '', '.sort');
  }
  console.log('contractId: ', contractId);
  console.log('node: ', node);
  console.log('vote: ', vote);

  let settings;
  if (vote > 0) {
    settings = {
      kind: 'UPVOTE',
    };
    query[node] = {
      upvotes: vote,
      userId: Meteor.userId(),
    };
  } else if (vote < 0) {
    settings = {
      kind: 'DOWNVOTE',
    };
    query[node] = {
      downvotes: vote,
      userId: Meteor.userId(),
    };
  }

  Contracts.update(
    { _id: contractId },
    { $push: query }
  );

  //transact(Meteor.userId(), contractId, 1, settings);

  /*Contracts.update(
    { _id: contractId },
    { $inc: { node: vote } }
  );*/
};
