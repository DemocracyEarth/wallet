import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Contracts } from '/imports/api/contracts/Contracts';

/*
import { Tags } from '/imports/api/tags/Tags';
import { convertToSlug } from '/lib/utils';


import { Collectives } from '../collectives/Collectives.js';

import { showFullName } from '../../startup/both/modules/utils';
*/

Meteor.methods({
  /**
  * @summary counts the total items on a collection.
  * @return {number} total count.
  */
  feedCount(query, options) {
    check(query, Object);
    check(options, Object);

    const count = Contracts.find(query, options).count();

    console.log(`{ method: 'feedCount', user: '${Meteor.user().username}', count: ${count} }`);
    return count;
  },
});

/**

  'updateContractTitle'({ contractId, text }) {
    Contracts.update(contractId, { $set: { title: text } });
  },

  updateContractDescription: function (contractId, text) {
    Contracts.update(contractId, { $set: { description: text} });
  },

  addCustomTagToContract: function (contractId, tagKeyword) {
    //Adds a tag to a contract
    var dbTag = lookupKeyword(tagKeyword, Tags);

    if (dbTag != undefined) {
      console.log('[addCustomTagToContract] adding tag ' + tagKeyword + ' to contract ' + contractId);
      if (checkDuplicate(Contracts.findOne(contractId, { tags: { _id: dbTag._id } }).tags, dbTag._id) == true ) {
        throw new Meteor.Error('duplicate-tags', 'This tag already exists in the contract');
      } else {
        return dbTag._id;
      }
    }
  },

  addCustomForkToContract: function (contractId, forkId) {
    var dbContract = Contracts.findOne({ _id: forkId }); //lookupKeyword(contractKeyword, Contracts);

    if (dbContract != undefined) {
      console.log('[addCustomForkToContract] adding new option ' + forkId + ' to contract ' + contractId);
      if (checkDuplicate (Contracts.findOne(contractId, { ballot: { _id: dbContract._id } }).ballot, dbContract._id) == false) {
        var rankVal = parseInt(Contracts.findOne({ _id: contractId }).ballot.length) + 1;
        Contracts.update(contractId, { $push: {
          ballot:
            {
              _id: dbContract._id,
              mode: 'FORK',
              url: dbContract.url,
              label: dbContract.title,
              rank: rankVal
            }
        }});
      } else {
        throw new Meteor.Error('duplicate-fork', 'This contract already exists in the contract');
      }
    }

  },

  createNewContract: function (contractTitle) {
    console.log('creating new contract with keyword: ' + contractTitle)
    return createContract(contractTitle);
  },

  addTagToContract: function (contractId, tagId) {
    if (checkDuplicate (Contracts.findOne(contractId, { tags: { _id: tagId } }).tags, tagId) == false) {
      Contracts.update(contractId, { $push: {
        tags:
          {
            _id: tagId,
            label: Tags.findOne({_id: tagId}).text,
            url: Tags.findOne({ _id: tagId}).url
          }
      }});
    } else {
      throw new Meteor.Error('duplicate-tags', 'This tag already exists in the contract');
    }
  },

  removeTagFromContract: function (contractId, tagId) {
    console.log('[removeTagFromContract] removing tag id ' + tagId);
    Contracts.update(contractId, { $pull: {
      tags:
        { _id: tagId }
    }});
  },

  removeFork: function (contractId, forkId) {
    console.log('[removeFork] removing fork id ' + forkId);
    Contracts.update(contractId, { $pull: {
      ballot:
        { _id: forkId}
    }})
  },

  //Gets an array with the new order of the items for a ballot.
  updateBallotRank: function (contractId, sortedBallotIDs) {
    for (var i=0; i < sortedBallotIDs.length; i++ ) {
      Contracts.update({ _id: contractId, "ballot._id": sortedBallotIDs[i] }, { $set: { "ballot.$.rank": parseInt(i+1) } });
    }
  },

  updateTagRank: function (contractId, sortedRankIDs) {
    for (var i=0; i < sortedRankIDs.length; i++ ) {
      Contracts.update({ _id: contractId, "tags._id": sortedRankIDs[i] }, { $set: { "tags.$.rank": parseInt(i+1) } });
    }
  },

  updateContractField: function(contractId, field, value) {
    var obj = {};
    obj[field] = value;
    Contracts.update(contractId, { $set: obj });
  },

  verifyUsername: function(strUsername) {
    console.log('[verifyUsername] verifying username: ' + strUsername + ', is present in db:' + Meteor.users.findOne({username: strUsername}))
    if (Meteor.users.findOne({username: strUsername}) != undefined) {
      return true;
    } else {
      if (strUsername.toLowerCase() == 'anonymous') { return true; };
      return false;
    }
  },

  getUserInfo: function (userId) {
    var objUser = Meteor.users.findOne({ _id: userId });
    if (objUser) {
      if (objUser['emails']) { delete objUser['emails']; };
      if (objUser['services']) { delete objUser['services']; };
      return objUser;
    } else {
      return false;
    }
  },

  getUserList: function (array) {
    const userList = [];
    let user = '';

    for (i in array) {
      user = Meteor.users.findOne({ _id: array[i] });
      let labelUser;
      if (user.profile && user.profile.firstName && user.profile.lastName) {
        labelUser = showFullName(user.profile.firstName, user.profile.lastName);
      } else {
        labelUser = user.username;
      }
      userList.push({
        id: user._id,
        label: labelUser,
        icon: user.profile.picture,
        iconActivated: false,
        feed: 'user',
        value: true,
        separator: false,
        url: '/peer/' + user.username,
        selected: false
      })
    }
    return userList;
  },

  getCollectiveInfo: function (collectiveId) {
    console.log('[getCollectiveInfo] getting info for collective ' + collectiveId);
    return Collectives.findOne({ _id: collectiveId });
  },

  insertContract: function (contract) {
    console.log('[insertContract] new contract');
    var newDeal = Contracts.insert(contract);
    console.log('[insertContract] new contract url: '  + newDeal.url);
    return newDeal;
  },

  getServerTime: function () {
    var _time = (new Date).toString();
    console.log('[getServerTime] date request : ' + _time);
    return _time;
  }

});


function lookupKeyword(keyword, db) {
  //Verifiy if a keyword is available in a field of a collection
  //returns field if available, or creates a new one otherwise in that collection.
  var slug = convertToSlug(keyword);
  var lookup = db.findOne({keyword: slug});

  if (lookup != undefined) {
    console.log('[lookupKeyword] found keyword in db ' + db._name + ' for ' + slug);
    return lookup;
  } else {
    console.log('[lookupKeyword] new insert in db ' + db._name + ' for:' + slug);
    switch (db._name) {
      case 'contracts':
        console.log('[lookupKeyword] inserting contracts...');
        var newInsert = createContract(keyword);
        break;
      case 'tags':
        console.log('[lookupKeyword] inserting to tags...');
        var newInsert = createTag(keyword);
        break;
    }
    return newInsert;
  }
}

function checkDuplicate (arr, elementId) {
  console.log("checkDuplicate arr", arr, elementId);
  for (var i = 0; i < arr.length; i++ ) {
    if (arr[i]._id == elementId ) {
      console.log('[checkDuplicate] this ' + elementId + ' is a duplicate');
      return true;
    }
  }
  console.log('[checkDuplicate] this ' + elementId + ' is NOT a duplicate');
  return false;
}

function createContract (keyword) {
  console.log('[createContract] new contract with keyword: ' + keyword);
  //Adds a new contract to db, returns created insert
  if (keyword != undefined || keyword != '') {
    var slug = convertToSlug(keyword);
  } else {
    var slug = convertToSlug('draft-' + Meteor.userId());
  }

  var creationDate = new Date;
  creationDate.setDate(creationDate.getDate() + 1);
  console.log('[createContract] new contract by user: ' + Meteor.userId());

  if (keyword != '') {
    //Creates new contract:
    console.log('[createContract] contract being created...');
    return Contracts.insert({ title: keyword });

  }

}

function createTag (tag) {
  //Adds a new tag to db, returns created insert
  var slug = convertToSlug(tag);
  Tags.insert({ text: tag });
  return Tags.findOne({keyword: slug});
}
*/
