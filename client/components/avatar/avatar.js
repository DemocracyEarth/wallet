Template.avatar.events({
  'change input[type="file"]' ( event, template ) {
    Modules.client.uploadToAmazonS3( { event: event, template: template } );
  }
});

Template.avatar.helpers({
  profilePicture: function () {
    if (Meteor.user().profile.picture == undefined) {
      return Router.path('home') + 'images/noprofile.png';
    } else {
      return Meteor.user().profile.picture;
    }
  }
})
