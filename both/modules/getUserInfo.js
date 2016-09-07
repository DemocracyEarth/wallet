var sessionIndex = new Array();

//returns information of user and updates session variable
let fetchUser = (userId, sessionVar) => {

  Meteor.call('getUserInfo', userId, function (error, data) {
    if (error)
      console.log(error);

      //TODO filter to deliver only what necessary
    Session.set(sessionVar, data);
  });

}


Modules.both.getUserInfo = fetchUser;
