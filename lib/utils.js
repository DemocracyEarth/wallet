import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import { timers } from '/lib/const';
import { Contracts } from '/imports/api/contracts/Contracts';
import { shortUUID } from '/imports/startup/both/modules/crypto';

// global variables
let contractId = 0;

//Global Methods
//Returns current app language
getUserLanguage = function () {
  // Put here the logic for determining the user language
  return $LANGUAGE;
};


/**
* @summary if _here
* @param {object} post data
* @param {array} feed list
* @return {boolean} 🙏
*/
export const here = (post, feed) => {
  for (const items in feed) {
    if (feed[items]._id === post._id) {
      return true;
    }
  }
  return false;
};


// Decides if it should hide or not a DOM element
export const displayElement = function (sessionVar) {
  if (Session.get(sessionVar)) {
    return '';
  } else {
    return 'display:none';
  }
};

// Displays a warning for a limited period.
export const displayTimedWarning = (warning, val) => {
  if (!val) {
    val = false;
  }
  if (Session.get(warning)) {
    Meteor.setTimeout(() => {
      Session.set(warning, val);
    }, timers.WARNING_DURATION);
  }
  return Session.get(warning);
};

// Contract constructor.
contract = function (title, description, tags) {
  this.title = title;
  this.description = description;
  this.tags = tags;
};

// converts a String to slug-like-text.
export const convertToSlug = function (text, max) {
  let slug = '';
  if (text !== undefined) {
    slug = text
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
  }
  if (max > 0) {
    slug = `${slug.substring(0, parseInt(max - 4, 10))}-${shortUUID()}`;
  }
  return slug;
};

//given a user profile it returns a slugged version of her name
slugName = function (profile) {
  var name = new String();
  if (profile != undefined) {
    if (profile.firstName != undefined) {
      name = convertToSlug(profile.firstName);
    }
    if (profile.lastName != undefined) {
      name += '-' + convertToSlug(profile.lastName);
    }
    if (name.length == 0) {
      name = convertToSlug(TAPi18n.__('anonymous'));
    }
  }
  return name;
};

// verifies the existence of duplicates in array list
export const checkDuplicate = function checkDuplicate(arr, elementId) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]._id === elementId) {
      return true;
    }
  }
  return false;
};

//for contenteditable with reactivity, remind of the caret position
getCaretPosition = function (element) {
  var caretOffset = 0;
  var doc = element.ownerDocument || element.document;
  var win = doc.defaultView || doc.parentWindow;
  var sel;
  if (typeof win.getSelection != "undefined") {
    sel = win.getSelection();
    if (sel.rangeCount > 0) {
      var range = win.getSelection().getRangeAt(0);
      var preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
  } else if ( (sel = doc.selection) && sel.type != "Control") {
    var textRange = sel.createRange();
    var preCaretTextRange = doc.body.createTextRange();
    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint("EndToEnd", textRange);
    caretOffset = preCaretTextRange.text.length;
  }
  return caretOffset;
};

setCaretPosition = function (elemId, caretPos) {
  var elem = document.getElementById(elemId);

  if(elem != null) {
    if(elem.createTextRange) {
      var range = elem.createTextRange();
      range.move('character', caretPos);
      range.select();
    }
    else {
      if(elem.selectionStart) {
        elem.focus();
        elem.setSelectionRange(caretPos, caretPos);
      }
      else
        elem.focus();
    }
  }
};
