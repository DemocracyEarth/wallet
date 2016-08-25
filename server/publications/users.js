// The user fields we are willing to publish.
const USER_FIELDS = {
  username: 1,
  profile: 1
};


// This will be used to store the subscription objects for later management
var subs = { };

// The helper publication
Meteor.publish('helperPublication', function() {

       // #1
       var subscription = this;
       subs[subscription._session.id] = subscription;

       // #2
       subscription.added( 'serverTime', 'a_random_id', {date: new Date()} );

       // #3
       subscription.onStop(function() {
          delete subs[subscription._session.id];
       });
});



Meteor.publish('singleUser', function (userId) {

  if (userId == undefined) {
    return '000'
  } else {
    console.log('singleUser called with userId ' + userId);
    // Make sure userId is a string.
    check(userId, String);

    var newId = guidGenerator();

    // console.log(Meteor.users.find({ _id: userId}, {fields: {profile: 1});
    var profile = Meteor.users.find({_id: userId}).fetch()[0].profile;

    this.newId = newId;
    this.profile = profile;
    var subscription = this;
    subs[this.userId] = subscription;




    subscription.added( 'serverTime', newId,  {date: new Date()});

    // #3
    // Publish a single user - make sure only allowed fields are sent.
    subscription.onStop(function() {
       delete subs[this.userId];
    });

    Meteor.setInterval(function() {
        var currentTime = new Date();
        for (var subscriptionID in subs) {
            var subscription = subs[subscriptionID];
            console.log(subscription.newId);
            subscription.changed( 'serverTime', newId,  {date: currentTime}  );
        }
    }, 1000);

  }
});

// on the server
Meteor.publish('posts', function(author) {
  return  Meteor.users.find({}, {fields: {profile: 1}});
});


function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};
