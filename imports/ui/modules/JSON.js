import {default as Modules} from "./_modules";

let JSONlookup = (source, keyword) => {
  const matchingFields = [];
  let sourceString = '';

  if (source !== undefined) {
    for (let i = 0; i < source.length; i++) {
      sourceString = source[i].name.toUpperCase();
      if (sourceString.indexOf(keyword.toUpperCase()) >= 0) {
        matchingFields.push(source[i]);
      }
    }
    return matchingFields;
  }
  return undefined;
};

export const searchJSON = JSONlookup;
