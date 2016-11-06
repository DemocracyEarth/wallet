import Modules from './_modules';
import { guidGenerator } from '../../startup/both/modules/crypto';
import Contracts from '../../api/contracts/Contracts';

let node = '';
let currentParent = '';

/*****
/* posts a comment on a thread
/* @param {string} contractId - contract where this comment goes.
/* @param {object} eventObject - object containing the event info
/* @param {string} replyId - if reply to another comment, id of such comment.
******/
let postComment = (contractId, eventObject, replyId) => {
  let thread = [];
  var index = new String();
  var query = {};
  if (replyId == undefined) {
    Contracts.update(contractId, { $push: {
      events: eventObject
    }});
  } else {
    //Add event object dynamic key values since Schema is blackboxed to enable infinite branching.
    eventObject.timestamp = new Date();
    eventObject.status = 'NEW';
    eventObject.id = guidGenerator();
    thread = Contracts.find({_id: Session.get('contract')._id }).fetch()[0].events;
    node = '';
    currentParent = '';
    for (children in thread) {
      node += searchTree(thread[children], replyId, children, true, '');
    }
    query[node] = eventObject;
    Contracts.update(
      { _id: contractId },
      { $push: query}
    );
  };
}

let searchTree = (element, matchingTitle, iterator, isRoot, inheritedPath) => {
  if (element.id == matchingTitle) {
    if (iterator != undefined) {
      if (isRoot) {
        parentStr = 'events.' + iterator.toString() + '.children';
      } else {
        parentStr = '.' + iterator.toString() + '.children';
      }
      if (isRoot) {
        return parentStr;
      } else {
        node += inheritedPath + parentStr;
        return node;
      }
    }
  } else if (element.children != undefined) {
    var i;
    var result = '';
    var arrPath = new Array();
    if (isRoot) {
      currentParent = 'events';
    }
    currentParent += '.' + iterator.toString() + '.children';
    for( i=0; result == '' && i < element.children.length; i++) {
      result = searchTree(element.children[i], matchingTitle, i, false, currentParent);
    }
    if (result == '') {
      currentParent = resolvePath(currentParent);
    }
    return result;
  }
  return '';
}

let resolvePath = (uri) => {
  var path = new Array();
  path = uri.split('.');
  path.splice(-2,2);
  uri = path.toString().replace(/,/g, ".");
  return uri;
}

Modules.client.postComment = postComment;
