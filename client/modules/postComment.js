import {default as Modules} from "./_modules";

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
    query[index] = eventObject;
    Contracts.update(
      { _id: contractId },
      { $push: query}
    );

  };


}


Modules.client.postComment = postComment;
