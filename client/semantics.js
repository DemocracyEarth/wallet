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
          var tagList = Contracts.findOne( { _id: Session.get('contractId') }, {reactive: false} ).tags;

          if (this.id == 'tagSuggestions') {
            if (Session.get('removeTag')) {
              removeTag(ui.item.get(0).getAttribute('value'));
              ui.item.get(0).remove();
              Session.set('removeTag', false);
            }
            Session.set('maxReached', false);
            Session.set('duplicateTags', false);
          } else if (this.id == 'tagList') {
            if (verifyTag(ui.item.get(0).getAttribute('value'))) {
              addTag(ui.item.get(0).getAttribute('value'));
            }
            ui.item.get(0).remove();
          }
        },
        cancel: '.nondraggable',
        connectWith: ".connectedSortable",
        forceHelperSize: true,
        helper: 'clone',
        zIndex: 9999,
        placeholder: 'tag tag-placeholder'
    });
    TagSearch.search('');
  }

  Template.semantics.helpers({
    semantics: function () {
      var tagDetails = [];
      var tagList = Contracts.findOne( { _id: Session.get('contractId') } ).tags;

      //Verify if it has a definition
      Session.set('unauthorizedTags', false);
      for (var i=0; i < tagList.length; i++) {
        tagDetails.push(Tags.find({ _id: tagList[i]._id}).fetch());
        if (tagDetails[i][0] != undefined) {
          if (tagDetails[i][0].isDefined == false) {
            Session.set('unauthorizedTags', true);
            break;
          }
        }
      };
      //Verify if reached maximum
      if (tagList.length >= MAX_TAGS_PER_CONTRACT) {
        Session.set('maxReached', true);
      } else {
        Session.set('maxReached', false);
      };

      return tagList;
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
    },
    "click #add-suggested-tag": function (event) {
      addTag(this._id);
    }
  });
}

addTag = function (tagId) {
  if (verifyTag(tagId)) {
    Meteor.call("addTagToContract", Session.get('contractId'), tagId, function (error) {
        if (error && error.error == 'duplicate-tags') {
          Session.set('duplicateTags', true)
        }
    });
  }
}

addCustomTag = function (tagString) {
  Meteor.call("addCustomTagToContract", Session.get('contractId'), tagString, function (error) {
    if (error && error.error == 'duplicate-tags') {
      Session.set('duplicateTags', true)
    }
  });
}

verifyTag = function (newTag) {
  var tagList = Contracts.findOne( { _id: Session.get('contractId') }, {reactive: false} ).tags;

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

removeTag = function(tagId) {
  Meteor.call("removeTagFromContract", Session.get('contractId'), tagId);
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
