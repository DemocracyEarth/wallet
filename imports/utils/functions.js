import { Promise } from 'meteor/promise';
import { _ } from 'meteor/underscore';

// Convert an NPM-style function returning a callback to one that returns a Promise.
export const denodeify = f => (...args) => new Promise((resolve, reject) => {
  f(...args, (err, val) => {
    if (err) {
      reject(err);
    } else {
      resolve(val);
    }
  });
});

export const buildRegExp = function (searchText) {
  const words = searchText.trim().split(/[ \-:]+/);
  const exps = _.map(words, function(word) {
    return `(?=.*${word})`;
  });
  const fullExp = exps.join('') + '.+';
  return new RegExp(fullExp, 'i');
};

// converts a String to slug-like-text.
export const convertToSlug = (text) => {
  if (text !== undefined) {
    return text
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '')
        ;
  }
  return undefined;
};
