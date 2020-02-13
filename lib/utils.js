import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { timers } from '/lib/const';
import slugify from 'slugify';

/**
* @summary return an ASCII-friendly, URL-friendly, safer slug-cased text.
*/
const _convertToSlug = function (text) {
  if (text === undefined) return undefined; // Contract's `Object.autoValue` may try to convert `undefined`.
  return slugify(text, { lower: true });
};

/**
* @summary return an somewhat email-friendly (among other things), safer username.
*/
const _convertToUsername = (unsafeUsername) => {
  return _convertToSlug(unsafeUsername).replace(/-+/, '');
};

/**
* @summary removes urls starting with /
*/
const _fixDBUrl = (url) => {
  if (url.first() === '/') {
    return url.substring(1);
  }
  return url;
};

/**
* @summary removes html present in text
*/
const _stripHTML = (html) => {
  let str = html;
  str = str.replace(/<\s*br\/*>/gi, '');
  str = str.replace(/<\s*a.*href="(.*?)".*>(.*?)<\/a>/gi, ' $2 (Link->$1) ');
  str = str.replace(/<\s*\/*.+?>/ig, '');
  str = str.replace(/ {2,}/gi, '');
  str = str.replace(/\n+\s*/gi, '');
  return str;
};

/**
* @summary hacky fixes for url strings
* @param {string} url to fix
* @return {string}
*/
const _urlDoctor = (url) => {
  let newUrl = url.replace('/http', 'http');
  if (newUrl.last() !== '/') {
    newUrl = newUrl.add('/');
  }
  return newUrl;
};

/**
* @summary all the usernames mentioned in a contract
* @param {object} contract to parse
* @returns {string} list with all @names
*/
const _getAllUsernames = (contract) => {
  let list = '';
  for (const i in contract.signatures) {
    list += `@${contract.signatures[i].username} `;
  }
  return list;
};

/**
* @summary title case for any string
* @param {string} str title this
* @returns {string} with Title Case
*/
const _toTitleCase = (str) => {
  const geo = Session.get('geo');
  for (const i in geo.country) {
    if (_convertToUsername(geo.country[i].name) === str) {
      return `${geo.country[i].emoji} ${geo.country[i].name}`;
    }
  }
  return '';
};

/**
* @summary prevents any corruption inside url
*/
const _parseURL = (url) => {
  if (url.substring(0, 4) === 'http') {
    // absolute
    return url;
  }
  // relative
  return `${_urlDoctor(Meteor.absoluteUrl.defaultOptions.rootUrl)}${_fixDBUrl(url)}`;
};


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

/**
* @summary decides if it should hide or not a DOM element
*/
const _displayElement = (sessionVar) => {
  if (Session.get(sessionVar)) {
    return '';
  }
  return 'display:none';
};

/**
* @summary displays a warning for a limited period.
*/
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

/**
* @summary checks if a string is a valid URL
*/
const _isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};


/**
* @summary wraps all urls in a string with an html anchor
* @param {string} text to parse
* @param {boolean} newWindow wheter to open new target or not
*/
const _wrapURLs = function (text, newWindow) {
  const pattern = /(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\x{00a1}\-\x{ffff}0-9]+-?)*[a-z\x{00a1}\-\x{ffff}0-9]+)(?:\.(?:[a-z\x{00a1}\-\x{ffff}0-9]+-?)*[a-z\x{00a1}\-\x{ffff}0-9]+)*(?:\.(?:[a-z\x{00a1}\-\x{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?/ig;
  const target = (newWindow === true || newWindow == null) ? '_blank' : '';

  return text.replace(pattern, function (url) {
    const protocolPattern = /^(?:(?:https?|ftp):\/\/)/i;
    const href = protocolPattern.test(url) ? url : `http://${url}`;
    return `<a href="${href}" target="${target}">${url} </a>`;
  });
};

/**
* @summary verifies the existence of duplicates in array list
*/
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
export const wrapURLs = _wrapURLs;
export const fixDBUrl = _fixDBUrl;
export const stripHTML = _stripHTML;
export const isValidUrl = _isValidUrl;
export const parseURL = _parseURL;
export const urlDoctor = _urlDoctor;
export const toTitleCase = _toTitleCase;
export const getAllUsernames = _getAllUsernames;
