let fetchUser = (userId, sessionVar) => {

  Meteor.call('getUserInfo', userId, function (error, data) {
    if (error)
      console.log(error);

    Session.set(sessionVar, data);
  });

}


Modules.both.getUserInfo = fetchUser;
