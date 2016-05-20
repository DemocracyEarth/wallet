Meteor.methods({
  storeUrlInDatabase: function( url ) {
    check( url, String );
    Modules.both.checkUrlValidity( url );

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
