Template.emailLogin.rendered = function () {
  Session.set("loginScreen", true);
}

Template.emailLogin.helpers({
  loginScreen: function () {
    return Session.get("loginScreen");
  }
});

Template.emailLogin.events({
  "click #signup": function (event) {
    Session.set("loginScreen", !Session.get("loginScreen"));
  },
  "submit #signup-new-user": function (event) {
    event.preventDefault();
    createNewUser(event.target);
  }
});
