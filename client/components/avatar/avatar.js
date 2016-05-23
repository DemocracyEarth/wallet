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
  },
  fullName: function () {
    if (Meteor.user().profile.firstName != undefined) {
      completeName = Meteor.user().profile.firstName + ' ' + Meteor.user().profile.lastName;
      if (completeName.length > MAX_PROFILE_NAME_LENGTH) {
        completeName = completeName.slice(0, parseInt(0 + (MAX_PROFILE_NAME_LENGTH - completeName.length))) + '...';
      }
      return completeName;
    } else {
      return Meteor.user().username;
    }
  },
  nationality: function () {
    if (Meteor.user().profile.country != undefined) {
      return Meteor.user().profile.country.name + ' ' + searchJSON(geoJSON.country, Meteor.user().profile.country.name)[0].emoji;
    } else {
      return TAPi18n.__('digital-citizen');
    }
  }
})
