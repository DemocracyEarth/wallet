import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Files } from '/imports/api/files/Files';
import { checkUrlValidity } from '../../modules/validations';

// pending to import somewhere
Meteor.methods({
  storeUrlInDatabase(url) {
    check(url, String);
    checkUrlValidity(url);
    try {
      return Files.insert({
        url,
        userId: Meteor.userId(),
        added: new Date(),
      });
    } catch (exception) {
      return exception;
    }
  },
});
