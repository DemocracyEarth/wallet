Template.socialMediaLogin.events({
  "click #facebook-login": function () {
    Meteor.loginWithFacebook({}, function(err){
      if (err) {
          throw new Meteor.Error("Facebook login failed " + err.reason);
      }
    });
  },
  "click #twitter-login": function () {
    Meteor.loginWithTwitter({}, function(err){
      if (err) {
          throw new Meteor.Error("Twitter login failed " + err.reason);
      }
    });
  },
  "click #agora-login": function (event) {
    Modules.client.displayLogin(event, document.getElementById('loggedUser'));
  }
})
