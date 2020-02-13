
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import { Files } from '/imports/api/files/Files';
import { emailDomainCheck, emailListCheck } from '/lib/permissioned';

const _validateEmail = (email) => {
  const val = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
  let validDomain = true;
  let validList = true;
  let validEmail = true;
  let valid = false;
  
  // TODO verify if email already exists in db
  
  if (Meteor.settings.public.app.config.permissioned.active) {
    // check if valid emailDomain
    if (Meteor.settings.public.app.config.permissioned.checkDomain) {
      validDomain = emailDomainCheck(email);
    }
    // check if email in emailList
    if (Meteor.settings.public.app.config.permissioned.checkList) {
      validList = emailListCheck(email);
    }
  }
  // check email format
  validEmail = val.test(email);

  valid = validDomain && validList && validEmail ? true : false;

  Session.set("invalidEmail", !valid);
  return valid;
}

let _fileExistsInDatabase = (url) => {
  return Files.findOne({ url, userId: Meteor.userId() }, { fields: { _id: 1 } });
};

let _isNotAmazonUrl = ( url ) => {
  return (url.indexOf(Meteor.settings.public.AWSHostingURL) < 0);
};

const _validateUrl = (url) => {
  if (_fileExistsInDatabase(url)) {
    return { valid: false, error: 'Sorry, this file already exists!' };
  }
  if (_isNotAmazonUrl(url)) {
    return { valid: false, error: `Sorry, this isn't a valid URL! ${url}` };
  }
  return { valid: true };
};

const validate = (url) => {
  const test = _validateUrl(url);
  if (!test.valid) {
    throw new Meteor.Error('file-error', test.error);
  }
};

export const checkUrlValidity = validate;
export const validateEmail = _validateEmail;
