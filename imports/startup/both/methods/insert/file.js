import { checkUrlValidity } from '../../modules/validations';

Meteor.methods({
  storeUrlInDatabase: function( url ) {
    check( url, String );
    checkUrlValidity( url );

    try {
      Files.insert({
        url: url,
        userId: Meteor.userId(),
        added: new Date()
      });
    } catch( exception ) {
      return exception;
    }
  }
});
