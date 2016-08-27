import {default as Modules} from "./_modules";

var node = new String();

/*****
/* @param
******/
let postComment = (contractId, eventObject, replyId) => {
  var thread = new Array();
  var index = new String();
  var query = {};

  if (replyId == undefined) {
    Contracts.update(contractId, { $push: {
      events: eventObject
    }});
  } else {
    thread = Contracts.find({_id: Session.get('contract')._id }).fetch()[0].events;
    for (var i = 0; i < thread.length; i++) {
      if (thread[i].id == replyId) {
        //thread[i].children.push(eventObject);
        index = 'events.' + i.toString() + '.children';
      }
    }

    node = '';

    for (children in thread) {
      node += searchTree(thread[children], replyId, children, true);
      if (node != '') {
        console.log(node);
      }
    }

/*

    query[index] = eventObject;
    Contracts.update(
      { _id: contractId },
      { $push: query}
    );

    */
  };

}

let searchTree = (element, matchingTitle, iterator, isRoot, hasDad) => {
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
        node += hasDad + parentStr;
        return node;
      }
    }
  } else if (element.children != null) {
    var i;
    var result = '';
    var currentParent = '';
    if (isRoot) {
      currentParent = 'events';
    }
    currentParent += '.' + iterator.toString() + '.children';
    for( i=0; result == '' && i < element.children.length; i++) {
      result = searchTree(element.children[i], matchingTitle, i, false, currentParent);
    }
    return result;
  }
  return '';
}




Modules.client.postComment = postComment;
