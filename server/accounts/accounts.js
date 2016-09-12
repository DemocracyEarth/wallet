/***
* at user creation the following specifications must be met
****/
Accounts.onCreateUser(function(options, user) {

  //normalize facebook data
  if (user.services.facebook) {
    if (options.profile) {
        options.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=large";
        options.profile.firstName = user.services.facebook.first_name;
        options.profile.lastName = user.services.facebook.last_name;

        var credential = new Array;
        if (options.profile.credentials != undefined) {
          credential = options.profile.credentials;
        }
        credential.push({
          source: 'facebook',
          URL: user.services.facebook.link,
          validated: true
        });

        options.profile.credentials = credential;
        //TODO detect country automatically

        user.profile = options.profile;
    }
  }

  //normalize twitter data
  if (user.services.twitter) {

    if (options.profile) {

      options.profile.picture = user.services.twitter.profile_image_url;
      options.profile.firstName = user.services.twitter.screenName;

      var credential = new Array;
      if (options.profile.credentials != undefined) {
        credential = options.profile.credentials;
      }
      credential.push({
        source: 'twitter',
        URL: 'http://twitter.com/' + user.services.twitter.screenName,
        validated: true
      })

      options.profile.credentials = credential;
      user.profile = options.profile;

    }
  }

  //no username is defined coming from Facebook login
  if (user.username == undefined || user.username == '') {
    console.log('[onCreateUser] no username is defined, generating a new one.')
    var newUsername = convertToSlug(user.profile.firstName) + convertToSlug(user.profile.lastName);
    var i = 0;
    while(Meteor.call('verifyUsername', newUsername, function(err, id) {
      if (id == true) {
        return false;
      } else {
        return true;
      }
    })) {
      i++;
      newUsername = newUsername + i;
    };
    user.username = newUsername;
  }

  return user;
});
