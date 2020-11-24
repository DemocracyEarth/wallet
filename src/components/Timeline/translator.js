import { without } from 'lodash';

const _isExpression = (keyword, list) => {
  if (keyword.match('.') || (keyword.match('[') && keyword.match(']'))) {
    for (const values of list) {
      if (values.match(keyword)) {
        return true;
      }
    }
  }
  return false;
}

const _hasModificaiton = (dictionary, keyword) => {
  const modificationKeys = Object.keys(dictionary);
  if (modificationKeys.includes(keyword)) return true;
  return false;
}

const _hasAddition = (dictionary, keyword) => {
  const additionValues = Object.values(dictionary);
  if (_isExpression(keyword, additionValues)) return true;
  if (additionValues.includes(keyword)) return true;
  return false;
}

function _getKeyByValue(object, value) {
  return Object.keys(object).find((key) => {
    if (object[key].match(value)) {
      return key;
    }
    return undefined;
  });
}

const _getParameters = (instruction) => {
  const params = without(instruction.split(/\.|\[|\]/), "");
  return params;
}


const _retrieveValue = (source, params) => {
  switch (params.length) {
    case 6:
      return source[params[0]][params[1]][params[2]][params[3]][params[4]][params[5]];
    case 5:
      return source[params[0]][params[1]][params[2]][params[3]][params[4]];
    case 4:
      return source[params[0]][params[1]][params[2]][params[3]];
    case 3:
      return source[params[0]][params[1]][params[2]];
    case 2:
      return source[params[0]][params[1]];
    case 1:
    default:
      return source[params[0]]
  }
}

/**
* @summary changes the data set to something that the user interface will understand
*/
const _translate = (dataset, dictionary) => {
  const finalRes = [];
  let newPoll = {};
  let finalPoll = {};
  let pollKeys;

  for (const poll of dataset) {
    newPoll = {};
    pollKeys = Object.keys(poll);

    for (const keyword of pollKeys) {
      if (_hasModificaiton(dictionary.modification, keyword)) {
        newPoll[dictionary.modification[keyword]] = poll[keyword]
      }
      if (_hasAddition(dictionary.addition, keyword)) {
        if (_isExpression(keyword, Object.values(dictionary.addition))) {
          const key = _getKeyByValue(dictionary.addition, keyword);
          const parameters = _getParameters(dictionary.addition[key])
          newPoll[key] = _retrieveValue(poll, parameters);
        } else {
          newPoll[_getKeyByValue(dictionary.addition, keyword)] = poll[keyword]
        }
      }
    }
    finalPoll = { ...poll, ...newPoll };
    finalRes.push(finalPoll);
  }
  return finalRes;
}

export const translate = _translate;
