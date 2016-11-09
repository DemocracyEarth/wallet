import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';

import { Tags } from '/imports/api/tags/Tags';
import { Contracts } from '/imports/api/contracts/Contracts';
import { displayNotice } from '/imports/ui/modules/notice';
import { rules } from './const';
import { TagSearch } from './global';
import { checkDuplicate } from './utils';

/****
Tags
*****/

//Adds a tag and saves ranking order in db
export const addTag = function addTag(tagId, index) {
  let keys = [];

  //ranks start at 1
  if (index == 0) { index = 1 };

  if (verifyTag(tagId)) {
    var arr = Session.get('dbTagList');

    //Adds new item in proper position
    for (var i=0; i < arr.length; i++) {
      if (arr[i].rank >= index) {
        arr[i].rank ++;
      }
    }
    arr.push(
      {
        _id: tagId,
        label: Tags.findOne({_id: tagId}).text,
        url: Tags.findOne({ _id: tagId}).url,
        rank: index
      }
    );

    // purge the ranks
    const kwyjibo = sortRanks(arr);

    //Sort for ranked positions
    let keys = getRankKeys(kwyjibo);

    //Insert in DB
    Contracts.update(Session.get('contract')._id, { $push: {
      tags: {
        _id: tagId,
        label: Tags.findOne({ _id: tagId }).text,
        url: Tags.findOne({ _id: tagId }).url,
        rank: index,
      },
    } });

    // Saves ranked positions in DB
    Meteor.call('updateTagRank', Session.get('contract')._id, keys);

    // Memory update in client
    Session.set('dbTagList', kwyjibo);

    return true;
  }
  return false;
};

//Adds a newly created tag on the contract
export const addCustomTag = function (tagString) {
  Meteor.call("addCustomTagToContract", Session.get('contract')._id, tagString, function (error, data) {
    if (error && error.error == 'duplicate-tags') {
      Session.set('duplicateTags', true)
    } else {
      addTag(data, parseInt(Session.get('dbTagList').length) + 1)
    }
  });
}

// Verify if tag meets criteria to be added on list
const verifyTag = function (newTag) {
  var tagList = getTagList();

  if (tagList.length >= rules.MAX_TAGS_PER_CONTRACT) {
    //Max reached
    Session.set('maxReached', true);
    return false;
  } else if (checkDuplicate(tagList, newTag)) {
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
export const removeTag = function removeTag(tagId) {
  let keys = [];
  let arr = Session.get('dbTagList');

  for (var i=0; i < arr.length; i++) {
    if (arr[i]._id == tagId) {
      arr.splice(i,1);
    }
  }

  Contracts.update(Session.get('contract')._id, { $pull: { tags: { _id: tagId } } });

  if (arr.length > 0) {
    const kwyjibo = sortRanks(arr);
    keys = getRankKeys(kwyjibo);
    Meteor.call('updateTagRank', Session.get('contract')._id, keys);

    // Memory update in client
    Session.set('dbTagList', kwyjibo);
  } else {
    Session.set('dbTagList', arr);
  }

}

// Returns the full list of tags of the current contract
const getTagList = function () {
  if (Session.get('dbTagList') == undefined) {
    return Contracts.findOne( { _id: Session.get('contract')._id }, { reactive: false }).tags;
  } else {
    return Session.get('dbTagList');
  }
}

// Resets the tag search box
export const resetTagSearch = function () {
  TagSearch.search('');
  document.getElementById("tagSearch").innerHTML = TAPi18n.__('search-tag');
  Session.set('createTag', false);
}

/****
Algorithms
*****/


//Gets the current keys from an array list
const getRankKeys = function (rankedObject) {
  var keysOnly = [];

  for (var i=0; i < rankedObject.length; i++) {
    if (rankedObject[i]._id != undefined) {
      keysOnly[parseInt(rankedObject[i].rank - 1)] = rankedObject[i]._id;
    }
  }
  return keysOnly;
}


//Sorts the ranks of tags
export const sortRanks = function sortRanks(rankedObject) {
  if (rankedObject == undefined) {
    return
  }
  const sortedRank = [];
  const keys = [];
  let k;

  //Sort by Rank on DB
  for (let i = 0; i < rankedObject.length; i++) {
    if (rankedObject[i].rank) {
      keys.push(rankedObject[i].rank);
    } else if (rankedObject[i] == undefined){
      keys.splice(i,1);
    }
  };

  keys.sort(function sortNumber(a, b) {
    return a - b;
  });

  for (let i = 0; i < keys.length; i++) {
    for (let k = 0; k < rankedObject.length; k++) {
      if (rankedObject[k].rank == keys[i]) {
        sortedRank.push(rankedObject[k]);
        sortedRank[i].rank = parseInt(i+1);
      }
    }
  }
  return sortedRank;
};

/****
Contracts
*****/

// Saves text description of contract on db
export const saveDescription = function (newHTML) {
  if (newHTML != Session.get('contract').description) {
    Contracts.update({ _id: Session.get('contract')._id }, { $set: { description: newHTML } });
    displayNotice('saved-draft-description', true);
  }
};
