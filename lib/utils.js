import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { timers } from '/lib/const';
import slug from 'slug';

/**
* @summary if _here
* @param {object} post data
* @param {array} feed list
* @return {boolean} 🙏
*/
const _here = (post, feed) => {
  for (const items in feed) {
    if (feed[items]._id === post._id) {
      return true;
    }
  }
  return false;
};

// Decides if it should hide or not a DOM element
const _displayElement = function (sessionVar) {
  if (Session.get(sessionVar)) {
    return '';
  }
  return 'display:none';
};

// Displays a warning for a limited period.
const _displayTimedWarning = (warning, val) => {
  let value = val;
  if (!val) {
    value = false;
  }
  if (Session.get(warning)) {
    Meteor.setTimeout(() => {
      Session.set(warning, value);
    }, timers.WARNING_DURATION);
  }
  return Session.get(warning);
};

// Return an ASCII-friendly, URL-friendly, safer slug-cased text.
const _convertToSlug = function (text) {
  if (text === undefined) return undefined; // Contract's `Object.autoValue` may try to convert `undefined`.
  return slug(text, { lower: true });
};

// Return an somewhat email-friendly (among other things), safer username.
const _convertToUsername = (unsafeUsername) => {
  return _convertToSlug(unsafeUsername).replace(/-+/, '');
};

// verifies the existence of duplicates in array list
const _checkDuplicate = (arr, elementId) => {
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i]._id === elementId) {
      return true;
    }
  }
  return false;
};

export const checkDuplicate = _checkDuplicate;
export const convertToUsername = _convertToUsername;
export const convertToSlug = _convertToSlug;
export const displayTimedWarning = _displayTimedWarning;
export const displayElement = _displayElement;
export const here = _here;
