Meteor.methods({

  //CRUD for Contracts
  //TBD: blockchain support goes here.

  updateContractTitle: function (contractId, text) {
    Contracts.update(contractId, { $set: { title: text} });
  },

  updateContractDescription: function (contractId, text) {
    Contracts.update(contractId, { $set: { description: text} });
  },

  addCustomTagToContract: function (contractId, tagKeyword) {
    //Adds a tag to a contract
    var dbTag = lookupKeyword(tagKeyword, Tags);

    if (dbTag != undefined) {
      console.log('adding tag ' + tagKeyword + ' to contract ' + contractId);
      if (checkDuplicate (Contracts.findOne(contractId, { tags: { _id: dbTag._id } }).tags, dbTag._id) == true ) {
        throw new Meteor.Error('duplicate-tags', 'This tag already exists in the contract');
      } else {
        return dbTag._id;
      }
    }
  },

  addCustomForkToContract: function (contractId, forkId) {
    var dbContract = Contracts.findOne({ _id: forkId }); //lookupKeyword(contractKeyword, Contracts);

    if (dbContract != undefined) {
      console.log('adding new option ' + forkId + ' to contract ' + contractId);
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
    return createContract(contractTitle)._id;
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
    console.log('removing tag id ' + tagId);
    Contracts.update(contractId, { $pull: {
      tags:
        { _id: tagId }
    }});
  },

  removeFork: function (contractId, forkId) {
    console.log('removing fork id ' + forkId);
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
  }

});


//Search engine
SearchSource.defineSource('tags', function(searchText, options) {
  var options = {sort: {isoScore: -1}, limit: 20};

  if(searchText) {
    var regExp = buildRegExp(searchText);
    var selector = {text: regExp, url: regExp};
    return Tags.find(selector, options).fetch();
  } else {
    return Tags.find({}, options).fetch();
  }
});

SearchSource.defineSource('contracts', function(searchText, options) {
  var options = {sort: {isoScore: -1}, limit: 20};

  if(searchText) {
    var regExp = buildRegExp(searchText);
    var selector = {title: regExp, url: regExp};
    return Contracts.find(selector, options).fetch();
  } else {
    return Contracts.find({}, options).fetch();
  }
});

function buildRegExp(searchText) {
  var words = searchText.trim().split(/[ \-\:]+/);
  var exps = _.map(words, function(word) {
    return "(?=.*" + word + ")";
  });
  var fullExp = exps.join('') + ".+";
  return new RegExp(fullExp, "i");
}


function lookupKeyword(keyword, db) {
  //Verifiy if a keyword is available in a field of a collection
  //returns field if available, or creates a new one otherwise in that collection.
  var slug = convertToSlug(keyword);
  var lookup = db.findOne({keyword: slug});

  if (lookup != undefined) {
    console.log('found keyword in db ' + db._name + ' for ' + slug);
    return lookup;
  } else {
    console.log('new insert in db ' + db._name + ' for:' + slug);
    switch (db._name) {
      case 'contracts':
        console.log('inserting contracts');
        var newInsert = createContract(keyword);
        break;
      case 'tags':
        console.log('inserting to tags');
        var newInsert = createTag(keyword);
        break;
    }
    return newInsert;
  }
}

function checkDuplicate (arr, elementId) {
  for (var i = 0; i < arr.length; i++ ) {
    if (arr[i]._id == elementId ) {
      console.log('this ' + elementId + ' is a duplicate');
      return true;
    }
  }
  console.log('this ' + elementId + ' is NOT a duplicate');
  return false;
}

function createContract (keyword) {
  //Adds a new contract to db, returns created insert
  var slug = convertToSlug(keyword);
  var creationDate = new Date;
  creationDate.setDate(creationDate.getDate() + 1);
  console.log('creating contract by user: ' + Meteor.userId());

  //Creates new contract:
  Contracts.insert({ title: keyword });
  
  return Contracts.findOne({keyword: slug});
}

function createTag (tag) {
  //Adds a new tag to db, returns created insert
  var slug = convertToSlug(tag);
  Tags.insert({
    text: tag,
    url: '/tag/' + slug,
    authors: [
      //{ _id: Meteor.userId(), username: Meteor.user().username }
    ],
    keyword: slug,
    createdAt: new Date(),
    lastUpdate: new Date(),
    isDefined: false,
    authorized: false
  });
  return Tags.findOne({keyword: slug});
}
