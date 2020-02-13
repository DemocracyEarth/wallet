import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';

import { Tags } from '/imports/api/tags/Tags';
import { Contracts } from '/imports/api/contracts/Contracts';
import { displayNotice } from '/imports/ui/modules/notice';
import { rules } from './const';
import { globalObj } from './global';
import { checkDuplicate } from './utils';

/*
algorithms
*/

// sorts the ranks of tags
export const sortRanks = function (rankedObject) {
  if (rankedObject === undefined) {
    return [];
  }
  const sortedRank = [];
  const keys = [];

  // sort by Rank on DB
  for (let i = 0; i < rankedObject.length; i += 1) {
    if (rankedObject[i].rank) {
      keys.push(rankedObject[i].rank);
    } else if (rankedObject[i] === undefined) {
      keys.splice(i, 1);
    }
  }

  keys.sort(function (a, b) { return a - b; });

  for (let i = 0; i < keys.length; i += 1) {
    for (let k = 0; k < rankedObject.length; k += 1) {
      if (rankedObject[k].rank === keys[i]) {
        sortedRank.push(rankedObject[k]);
        sortedRank[i].rank = parseInt(i + 1, 10);
      }
    }
  }
  return sortedRank;
};

// Returns the full list of tags of the current contract
const getTagList = function () {
  if (Session.get('dbTagList') === undefined) {
    return Contracts.findOne({ _id: Session.get('contract')._id }, { reactive: false }).tags;
  }
  return Session.get('dbTagList');
};

// Verify if tag meets criteria to be added on list
const verifyTag = function (newTag) {
  const tagList = getTagList();

  if (tagList.length >= rules.MAX_TAGS_PER_CONTRACT) {
    // max reached
    Session.set('maxReached', true);
    return false;
  } else if (checkDuplicate(tagList, newTag)) {
    // there's a duplicate
    Session.set('duplicateTags', true);
    return false;
  }
  // add the tag
  Session.set('maxReached', false);
  return true;
};

// gets the current keys from an array list
const getRankKeys = function (rankedObject) {
  const keysOnly = [];

  for (let i = 0; i < rankedObject.length; i += 1) {
    if (rankedObject[i]._id !== undefined) {
      keysOnly[parseInt(rankedObject[i].rank - 1, 10)] = rankedObject[i]._id;
    }
  }
  return keysOnly;
};

/*
Tags
*/

// Adds a tag and saves ranking order in db
export const addTag = function (tagId, index) {
  // let keys = [];
  const idx = index === 0 ? 1 : index;

  if (verifyTag(tagId)) {
    const arr = Session.get('dbTagList');

    // Adds new item in proper position
    for (let i = 0; i < arr.length; i += 1) {
      if (arr[i].rank >= idx) {
        arr[i].rank += 1;
      }
    }
    arr.push(
      {
        _id: tagId,
        label: Tags.findOne({ _id: tagId }).text,
        url: Tags.findOne({ _id: tagId }).url,
        rank: idx,
      }
    );

    // purge the ranks
    const kwyjibo = sortRanks(arr);

    // Sort for ranked positions
    const keys = getRankKeys(kwyjibo);

    // Insert in DB
    Contracts.update(Session.get('contract')._id, { $push: {
      tags: {
        _id: tagId,
        label: Tags.findOne({ _id: tagId }).text,
        url: Tags.findOne({ _id: tagId }).url,
        rank: idx,
      },
    } });

    // saves ranked positions in DB
    Meteor.call('updateTagRank', Session.get('contract')._id, keys);

    // memory update in client
    Session.set('dbTagList', kwyjibo);

    return true;
  }
  return false;
};

// adds a newly created tag on the contract
export const addCustomTag = function (tagString) {
  Meteor.call('addCustomTagToContract', Session.get('contract')._id, tagString, function (error, data) {
    if (error && error.error === 'duplicate-tags') {
      Session.set('duplicateTags', true);
    } else {
      addTag(data, parseInt(Session.get('dbTagList').length, 10) + 1);
    }
  });
};

// Removes a tag
export const removeTag = function (tagId) {
  let keys = [];
  const arr = Session.get('dbTagList');

  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i]._id === tagId) {
      arr.splice(i, 1);
    }
  }

  Contracts.update(Session.get('contract')._id, { $pull: { tags: { _id: tagId } } });

  if (arr.length > 0) {
    const kwyjibo = sortRanks(arr);
    keys = getRankKeys(kwyjibo);
    Meteor.call('updateTagRank', Session.get('contract')._id, keys);

    // memory update in client
    Session.set('dbTagList', kwyjibo);
  } else {
    Session.set('dbTagList', arr);
  }
};

// Resets the tag search box
export const resetTagSearch = function () {
  globalObj.TagSearch.search('');
  document.getElementById('tagSearch').innerHTML = TAPi18n.__('search-tag');
  Session.set('createTag', false);
};

/** **
Contracts
*****/

// Saves text description of contract on db
export const saveDescription = function (newHTML) {
  if (newHTML !== Session.get('contract').description) {
    Contracts.update({ _id: Session.get('contract')._id }, { $set: { description: newHTML } });
    displayNotice('saved-draft-description', true);
  }
};
