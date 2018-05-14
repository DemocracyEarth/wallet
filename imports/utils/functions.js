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

// Return a URL-friendly, safer slug-cased text.
export const convertToSlug = (text) => {
  throw new Error("Deprecated ; use convertToSlug from lib/utils");
  // if (text !== undefined) {
  //   return slug(text, {lower: true});
  // }
  // return undefined;
};



