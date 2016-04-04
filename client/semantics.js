if (Meteor.isClient) {

  var MAX_TAGS_PER_CONTRACT = 3;
  var MIN_TAGS_PER_CONTRACT = 1;

  Meteor.startup(function () {

    //Serch Engine for Tags
    var options = {
      keepHistory: 1000 * 60 * 5,
      localSearch: true
    };
    var fields = ['text', 'url'];

    Session.set('createTag', false);
    TagSearch = new SearchSource('tags', fields, options);

  });


  //Makes tags in contract draggable
  Template.semantics.rendered = function () {
    this.$('#tagSuggestions, #tagList').sortable({
        stop: function(e, ui) {
          Session.set('removeTag', false);
        },
        start: function (event, ui) {
          ui.helper.width(ui.helper.width() + 3);
          ui.placeholder.width(ui.item.width());
          if (this.id == "tagList") {
            Session.set('removeTag', true);
          }
        },
        receive: function (event, ui) {
          if (this.id == 'tagSuggestions') {
            if (Session.get('removeTag')) {
              removeTag(ui.item.get(0).getAttribute('value'));
              ui.item.get(0).remove();
              Session.set('removeTag', false);
            }
            Session.set('maxReached', false);
            Session.set('duplicateTags', false);
          } else if (this.id == 'tagList') {
            /*var rankOrder = new Array();
            $('#tagList li').each(function( index ) {
              rankOrder.push($( this ).attr('value'));
            });
            for (var i=rankOrder.length; i > 0; i--) {
              if (i > ui.item.index()) {
                rankOrder[i] = rankOrder[i-1];
              }
            }
            rankOrder[ui.item.index()] = ui.item.get(0).getAttribute('value');*/

            if(addTag(ui.item.get(0).getAttribute('value'), ui.item.index()) == true) {
              var element = ui.item.get(0).childNodes[1].childNodes[6];
              element.parentNode.removeChild(element);
              ui.item.get(0).remove();
            } else {
              ui.item.get(0).remove();
            }
          }
        },
        revert: 100,
        cancel: '.nondraggable',
        connectWith: ".connectedSortable",
        forceHelperSize: true,
        helper: 'clone',
        zIndex: 9999,
        placeholder: 'tag tag-placeholder'
    });
    TagSearch.search('');
    Session.set('dbTagList', Contracts.findOne( { _id: Session.get('contractId') }, {reactive: false}).tags );
  }

  Template.semantics.helpers({
    semantics: function () {
      return sortRanks(Session.get('dbTagList')); //Contracts.findOne( { _id: Session.get('contractId') }).tags );
    },
    getTags: function() {
      var search = TagSearch.getData({
        transform: function(matchText, regExp) {
          return matchText.replace(regExp, "<b>$&</b>")
        },
        sort: {isoScore: -1}
      });
      return search;
    },
    createTag: function () {
      return displayElement('createTag');
    },
    removeTag: function () {
      return displayElement('removeTag');
    },
    newTag: function () {
      return Session.get('newTag');
    },
    emptyList: function () {
      if (Contracts.findOne( { _id: Session.get('contractId') } ).tags.length == 0) {
        return '';
      } else {
        return 'display:none';
      }
    },
    searchBox: function () {
      if (Session.get('searchBox')) {
        return 'search-active';
      } else {
        return '';
      }
    },
    unauthorizedTags: function() {
      return Session.get('unauthorizedTags');
    },
    maxReached: function () {
      return displayTimedWarning('maxReached');
    },
    minTags: function () {
      return displayTimedWarning('minTags');
    },
    duplicateTags: function() {
      return displayTimedWarning('duplicateTags');
    },
    voteKeyword: function () {
      return Session.get('voteKeyword');
    },
    sample: function () {
      return Session.get('searchSample');
    }
  });

  Template.tag.helpers({
    authorization: function (hover) {
      return 'authorized';
    }
  });

  Template.semantics.events({
    "keypress #tagSearch": function (event) {
      if (Session.get('createTag') && event.which == 13) {
        addCustomTag(document.getElementById("tagSearch").innerHTML.replace(/&nbsp;/gi,''));
        resetTagSearch();
        document.getElementById("tagSearch").innerHTML = '';
      }
      return event.which != 13;
    },
    "input #tagSearch": function (event) {
      var content = document.getElementById("tagSearch").innerHTML.replace(/&nbsp;/gi,'');
      TagSearch.search(content);

      if (TagSearch.getData().length == 0 && content != '') {
        Session.set('createTag', true);
        Session.set('newTag', content);
      } else {
        Session.set('createTag', false);
      }
    },
    "focus #tagSearch": function (event) {
      document.getElementById("tagSearch").innerHTML = '';
      Session.set('searchBox', true);
    },
    "blur #tagSearch": function (event) {
      if (Session.get('createTag') == false) {
        resetTagSearch();
      }
      Session.set('searchBox', false);
    },
    "click #add-custom-tag": function (event) {
      event.preventDefault();
      addCustomTag(document.getElementById("tagSearch").innerHTML.replace(/&nbsp;/gi,''));
      Meteor.setTimeout(function () {
        resetTagSearch();
      }, 100);
    }
  });

  Template.tag.events({
    "click #add-suggested-tag": function (event) {
      addTag(this._id, parseInt(Session.get('dbTagList').length) + 1);
    }
  });
}

addTag = function (tagId, index) {
  var keys = [];

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

    kwyjibo = sortRanks(arr);

    //Sort for ranked positions
    keys = getRankKeys(kwyjibo);

    //Insert in DB
    Contracts.update(Session.get('contractId'), { $push: {
      tags:
        {
          _id: tagId,
          label: Tags.findOne({_id: tagId}).text,
          url: Tags.findOne({ _id: tagId}).url,
          rank: index
        }
    }});

    //Saves ranked positions in DB
    Meteor.call('updateTagRank', Session.get('contractId'), keys);

    //Memory update in client
    Session.set('dbTagList', kwyjibo);

    return true;
  } else {
    return false;
  }
}

addCustomTag = function (tagString) {
  Meteor.call("addCustomTagToContract", Session.get('contractId'), tagString, function (error) {
    if (error && error.error == 'duplicate-tags') {
      Session.set('duplicateTags', true)
    } else {
      Session.set('dbTagList', Contracts.findOne( { _id: Session.get('contractId') }, {reactive: false}).tags );
    }
  });
}

getRankKeys = function (rankedObject) {
  var keysOnly = [];

  for (var i=0; i < rankedObject.length; i++) {
    if (rankedObject[i]._id != undefined) {
      keysOnly[parseInt(rankedObject[i].rank - 1)] = rankedObject[i]._id;
      //keys[i] = kwyjibo[i]._id;
      //console.log('Asi va: ' + kwyjibo[i].rank);
    }
  }
  console.log('keysOnly: ' + keysOnly);
  return keysOnly;
}

verifyTag = function (newTag) {
  var tagList = getTagList(); //= Session.get('dbTagList');//Contracts.findOne( { _id: Session.get('contractId') }, {reactive: false} ).tags;

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

sortRanks = function (rankedObject) {
  var sortedRank = []
  var keys = [],
      k, i, len;

  //Sort by Rank on DB
  for (var i = 0; i < rankedObject.length; i++) {
    if (rankedObject[i].rank) {
      keys.push(rankedObject[i].rank);
    } else if (rankedObject[i] == undefined){
      console.log('delete this: ' + keys.splice(i,1) + ' index: ' + i);
      keys.splice(i,1);
    }
  };
  console.log('keys mid sort: ' + keys);
  keys.sort(function sortNumber(a,b) {
    return a - b;
  });
  console.log('keys post sort: ' + keys);

  for (i = 0; i < keys.length; i++) {
    for (k=0; k < rankedObject.length; k++) {
      if (rankedObject[k].rank == keys[i]) {
        sortedRank.push(rankedObject[k]);
        sortedRank[i].rank = parseInt(i+1);
      }
    }
    console.log('full sort for index' + sortedRank[i].rank + ' has ' + sortedRank[i].label);

  }

  console.log('full sort:' + sortedRank);
  return sortedRank;
}

removeTag = function(tagId) {
  var keys = [];
  var arr = Session.get('dbTagList');

  for (var i=0; i < arr.length; i++) {
    if (arr[i]._id == tagId) {
      arr.splice(i,1);
      //break;
    }
  }

  kwyjibo = sortRanks(arr);
  keys = getRankKeys(kwyjibo);

  for (var i=0; i < kwyjibo.length; i++ ) {
    console.log('after deletion i get: ' + kwyjibo[i].rank)
  }

  Contracts.update(Session.get('contractId'), { $pull: {
    tags:
      { _id: tagId }
  }});

  Meteor.call('updateTagRank', Session.get('contractId'), keys);

  //Memory update in client
  Session.set('dbTagList', kwyjibo);

  //Session.set('dbTagList', Contracts.findOne( { _id: Session.get('contractId') }, {reactive: false}).tags );
}

getTagList = function () {
  if (Session.get('dbTagList') == undefined) {
    return Contracts.findOne( { _id: Session.get('contractId') }, {reactive: false}).tags;
  } else {
    return Session.get('dbTagList');
  }
}

resetTagSearch = function () {
  TagSearch.search('');
  document.getElementById("tagSearch").innerHTML = TAPi18n.__('search-tag');
  Session.set('createTag', false);
}

function checkDuplicate (arr, elementId) {
  for (var i = 0; i < arr.length; i++ ) {
    if (arr[i]._id == elementId ) {
      return true;
    }
  }
  return false;
}
