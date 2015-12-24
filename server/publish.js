if (Meteor.isServer) {

  //This code only runs on the server
  //Loads current contract and full tag dictionary.

  Meteor.publish("tags", function () {
    return Tags.find();
  });

  Meteor.publish("contracts", function() {
    return Contracts.find();
  });


  Meteor.startup(function () {
    // code to run on server at startup

  });
}
