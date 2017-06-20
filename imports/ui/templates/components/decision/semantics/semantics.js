import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

import { Contracts } from '/imports/api/contracts/Contracts';
import { Tags } from '/imports/api/tags/Tags';
import { addTag, removeTag, sortRanks, addCustomTag, resetTagSearch } from '/lib/data';
import { globalObj } from '/lib/global';
import { displayTimedWarning, displayElement } from '/lib/utils';
import { getRightToVote } from '/imports/ui/modules/ballot';

import './semantics.html';
import '../tag/tag.js';
import '../../../widgets/warning/warning.js';

Template.semantics.onCreated(() => {
  if (!Session.get('contract')) {
    Template.instance().contract = new ReactiveVar(Template.currentData().contract);
  } else {
    Template.instance().contract = new ReactiveVar(Contracts.findOne({ _id: Session.get('contract')._id }));
  }

  Template.instance().rightToVote = new ReactiveVar(getRightToVote(Template.instance().contract.get()));
});

// Makes tags in contract draggable
Template.semantics.onRendered(() => {
  if (!Template.instance().contract.get()) {
    return;
  }
  if (Template.instance().contract.get().stage === 'DRAFT') {
    this.$('#tagSuggestions, #tagList').sortable({
      stop(e, ui) {
        Session.set('removeTag', false);
      },
      start(event, ui) {
        ui.helper.width(ui.helper.width() + 3);
        ui.placeholder.width(ui.item.width());
        if (this.id === 'tagList') {
          Session.set('removeTag', true);
        }
      },
      receive(event, ui) {
        if (this.id === 'tagSuggestions') {
          if (Session.get('removeTag')) {
            removeTag(ui.item.get(0).getAttribute('value'));
            ui.item.get(0).remove();
            Session.set('removeTag', false);
          }
          Session.set('maxReached', false);
          Session.set('duplicateTags', false);
        } else if (this.id == 'tagList') {
          if (addTag(ui.item.get(0).getAttribute('value'), ui.item.index()) === true) {
            const element = ui.item.get(0).childNodes[1].childNodes[6];
            element.parentNode.removeChild(element);
            ui.item.get(0).remove();
          } else {
            ui.item.get(0).remove();
          }
        }
      },
      revert: 100,
      cancel: '.nondraggable',
      connectWith: '.connectedSortable',
      forceHelperSize: true,
      helper: 'clone',
      zIndex: 9999,
      placeholder: 'tag tag-placeholder',
    });
    globalObj.TagSearch.search('');
  }

  Session.set('dbTagList', Contracts.findOne({ _id: Template.instance().contract.get()._id }, { reactive: false }).tags);
});

Template.semantics.helpers({
  emptyTags() {
    if (Template.instance().contract.get().stage !== 'DRAFT' && Template.instance().contract.get().tags.length === 0) {
      return true;
    }
    return false;
  },
  semantics() {
    return sortRanks(Session.get('dbTagList'));
  },
  getTags() {
    const search = globalObj.TagSearch.getData({
      transform(matchText, regExp) {
        return matchText.replace(regExp, '<b>$&</b>')
      },
      sort: { isoScore: -1 }
    });
    if (!(Session.get('createTag') || Session.get('searchBox')) || search.length === 0) {
      return Tags.find({}).fetch().slice(0, 50);
    } else {
      return search;
    }
  },
  createTag() {
    return displayElement('createTag');
  },
  removeTag() {
    return displayElement('removeTag');
  },
  emptyDb() {
    if (displayElement('createTag') === '') {
      return 'display:none';
    }
    if (globalObj.TagSearch.getData({}).length > 0 || Tags.find({}).fetch().length > 0) {
      return 'display:none';
    }
    return '';
  },
  newTag() {
    return Session.get('newTag');
  },
  emptyList() {
    if (Session.get('dbTagList') !== undefined) {
      if (Session.get('dbTagList').length <= 0) {
        Session.set('noTags', true);
        return 'height:0;';
      } else {
        Session.set('noTags', false);
        return 'display:none';
      }
    }
  },
  searchBox() {
    if (Session.get('searchBox')) {
      return 'search-active';
    } else {
      return '';
    }
  },
  noTags() {
    return Session.get('noTags');
  },
  unauthorizedTags() {
    return Session.get('unauthorizedTags');
  },
  maxReached() {
    return displayTimedWarning('maxReached');
  },
  minTags() {
    return displayTimedWarning('minTags');
  },
  duplicateTags() {
    return displayTimedWarning('duplicateTags');
  },
  voteKeyword() {
    return Session.get('voteKeyword');
  },
  sample() {
    return Session.get('searchSample');
  },
  alreadyVoted() {
    return Session.get('alreadyVoted');
  },
  rightToVote() {
    return Template.instance().rightToVote.get();
  },
});

Template.semantics.events({
  'keypress #tagSearch'(event) {
    if (Session.get('createTag') && event.which === 13) {
      addCustomTag(document.getElementById('tagSearch').innerHTML.replace(/&nbsp;/gi, ''));
      resetTagSearch();
      document.getElementById('tagSearch').innerHTML = '';
    }
    Session.set('searchBox', true);
    return event.which !== 13;
  },
  'input #tagSearch'(event) {
    const content = document.getElementById('tagSearch').innerHTML.replace(/&nbsp;/gi, '');
    globalObj.TagSearch.search(content);

    if (globalObj.TagSearch.getData().length === 0 && content !== '') {
      Session.set('createTag', true);
      Session.set('newTag', content);
    } else {
      Session.set('createTag', false);
    }
  },
  'focus #tagSearch'(event) {
    document.getElementById('tagSearch').innerHTML = '';
  },
  'blur #tagSearch'(event) {
    // if (Session.get('createTag') == false) {
    resetTagSearch();
    // }
    Session.set('searchBox', false);
  },
  'click #add-custom-tag'(event) {
    event.preventDefault();
    addCustomTag(document.getElementById('tagSearch').innerHTML.replace(/&nbsp;/gi, ''));
    Meteor.setTimeout(function () {
      resetTagSearch();
    }, 100);
  },
});
