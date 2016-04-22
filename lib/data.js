/****
Tags
*****/

//Adds a newly created tag on the contract
addCustomTag = function (tagString) {
  Meteor.call("addCustomTagToContract", Session.get('contractId'), tagString, function (error, data) {
    if (error && error.error == 'duplicate-tags') {
      Session.set('duplicateTags', true)
    } else {
      addTag(data, parseInt(Session.get('dbTagList').length) + 1)
    }
  });
}

//Verify if tag meets criteria to be added on list
verifyTag = function (newTag) {
  var tagList = getTagList();

  if (tagList.length >= MAX_TAGS_PER_CONTRACT) {
    //Max reached
    Session.set('maxReached', true);
    return false;
  } else if (checkDuplicate(tagList,newTag)) {
    //There's a duplicate
    Session.set('duplicateTags', true);
    return false;
  } else {
    //Add the tag
    Session.set('maxReached', false);
    return true;
  }
}

//Removes a tag
removeTag = function(tagId) {
  var keys = [];
  var arr = Session.get('dbTagList');

  for (var i=0; i < arr.length; i++) {
    if (arr[i]._id == tagId) {
      arr.splice(i,1);
    }
  }

  Contracts.update(Session.get('contractId'), { $pull: {
    tags:
      { _id: tagId }
  }});

  if (arr.length > 0) {
    kwyjibo = sortRanks(arr);
    keys = getRankKeys(kwyjibo);
    Meteor.call('updateTagRank', Session.get('contractId'), keys);

    //Memory update in client
    Session.set('dbTagList', kwyjibo);
  } else {
    Session.set('dbTagList', arr);
  }

}

//Returns the full list of tags of the current contract
getTagList = function () {
  if (Session.get('dbTagList') == undefined) {
    return Contracts.findOne( { _id: Session.get('contractId') }, {reactive: false}).tags;
  } else {
    return Session.get('dbTagList');
  }
}

//Resets the tag search box
resetTagSearch = function () {
  TagSearch.search('');
  document.getElementById("tagSearch").innerHTML = TAPi18n.__('search-tag');
  Session.set('createTag', false);
}

/****
Algorithms
*****/


//Gets the current keys from an array list
getRankKeys = function (rankedObject) {
  var keysOnly = [];

  for (var i=0; i < rankedObject.length; i++) {
    if (rankedObject[i]._id != undefined) {
      keysOnly[parseInt(rankedObject[i].rank - 1)] = rankedObject[i]._id;
    }
  }
  return keysOnly;
}


//Sorts the ranks of tags
sortRanks = function (rankedObject) {

  if (rankedObject == undefined) { return };

  var sortedRank = []
  var keys = [],
      k, i, len;

  //Sort by Rank on DB
  for (var i = 0; i < rankedObject.length; i++) {
    if (rankedObject[i].rank) {
      keys.push(rankedObject[i].rank);
    } else if (rankedObject[i] == undefined){
      keys.splice(i,1);
    }
  };

  keys.sort(function sortNumber(a,b) {
    return a - b;
  });

  for (i = 0; i < keys.length; i++) {
    for (k=0; k < rankedObject.length; k++) {
      if (rankedObject[k].rank == keys[i]) {
        sortedRank.push(rankedObject[k]);
        sortedRank[i].rank = parseInt(i+1);
      }
    }
  }

  return sortedRank;
}

/****
Contracts
*****/

//adds a new proposal to searchbox
addNewProposal = function () {
  if (Session.get('proposalURLStatus') == 'AVAILABLE') {
    Meteor.call("createNewContract", Session.get('newProposal'), function (error, data) {
      if (error && error.error == 'duplicate-fork') {
        Session.set('duplicateFork', true)
      } else {
        Meteor.call("addCustomForkToContract", Session.get('contractId'), data, function (error) {
            if (error && error.error == 'duplicate-fork') {
              Session.set('duplicateFork', true)
            } else {
              Session.set('dbContractBallot', Contracts.findOne( { _id: Session.get('contractId') }, {reactive: false}).ballot );
              ProposalSearch.search('');
              document.getElementById("searchInput").innerHTML = '';
              Session.set('proposalURLStatus', 'UNAVAILABLE');
              Session.set('createProposal', false);
            }
        });
      }
    });
  }
}

//Saves text description of contract on db
saveDescription = function (newHTML) {
  if (newHTML != getContract(Session.get('contractId')).description) {
    Contracts.update( { _id: Session.get('contractId') }, { $set: { description: newHTML} });
    Session.set('noticeDisplay', 'saved-draft-description');
  }
}

//Gets current contract info
getContract = function (contractId) {
  if (contractId != undefined ) {
    return Contracts.findOne( { _id: contractId } );
  } else {
    if (Session.get('contractId') != undefined) {
      return Contracts.findOne( { _id: Session.get('contractId') } );
    } else if (Session.get('voteKeyword') != undefined) {
      var contract = Contracts.findOne( { keyword: Session.get('voteKeyword') } );
      Session.set('contractId', contract._id);
      return contract;
    }
  }
}
