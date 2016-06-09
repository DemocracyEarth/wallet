Accounts.onCreateUser(function(options, user) {

  console.log(  user);

    //Normalize Facebook data
    if (user.services.facebook) {
      if (options.profile) {
          options.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=large";
          options.profile.firstName = user.services.facebook.first_name;
          options.profile.lastName = user.services.facebook.last_name;

          var credential = new Array;
          credential.push({
            source: 'Facebook',
            URL: user.services.facebook.link,
            validated: true
          });

          options.profile.credentials = credential;
          //TODO detect country automatically

          user.profile = options.profile;
      }
    }

    return user;
});
