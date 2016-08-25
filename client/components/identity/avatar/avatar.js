Template.avatar.rendered = function () {
  Session.set('editor', false);
}

Template.avatar.helpers({
  classStyle: function (smallFont) {
    if (smallFont) {
      return 'identity-small';
    } else {
      return '';
    }
  },
  profilePicture: function (profile) {
    if (profile == undefined) {
      if (Meteor.user() != undefined) {
        if (Meteor.user().profile.picture == undefined) {
          return Router.path('home') + 'images/noprofile.png';
        } else {
          return Meteor.user().profile.picture;
        }
      }
    } else {
      if (profile.picture != undefined) {
        return profile.picture;
      } else {
        //it's a user id.
        var stringId = new String(profile + Meteor.userId() + 'pic');
        Modules.both.getUserInfo(profile, stringId);
        return Session.get(stringId).profile.picture;
      }
    }
  },
  pictureSize: function (size, includeName) {
    var style = new String();
    if (size != undefined) {
      style = 'width:' + size + 'px; height:' + size + 'px; '
    }
    if (includeName == false) {
      style += 'float: none';
    }
    return style;
  },
  fullName: function (profile) {
    if (profile == undefined) {
      if (Meteor.user() != undefined) {
        if (Meteor.user().profile.firstName != undefined) {
          return Modules.client.showFullName(Meteor.user().profile.firstName, Meteor.user().profile.lastName);
        } else {
          return Meteor.user().username;
        }
      }
    } else {
      if (profile.firstName != undefined) {
        return Modules.client.showFullName(profile.firstName, profile.lastName);
      } else {
        //it's a user id.
        var stringId = new String(profile + Meteor.userId() + 'name');
        Modules.both.getUserInfo(profile, stringId);
        return Modules.client.showFullName(Session.get(stringId).profile.firstName, Session.get(stringId).profile.lastName);
      }
    }
  },
  nationality: function (profile) {
    if (profile == undefined) {
      if (Meteor.user() != undefined) {
        if (Meteor.user().profile.country != undefined) {
          return Meteor.user().profile.country.name + ' ' + Modules.client.searchJSON(geoJSON.country, Meteor.user().profile.country.name)[0].emoji;
        } else {
          return TAPi18n.__('digital-citizen');
        }
      }
    } else {
      if (profile.country != undefined) {
        return profile.country.name + ' ' + Modules.client.searchJSON(geoJSON.country, profile.country.name)[0].emoji;
      } else {
        //it's a user id.
        var stringId = new String(profile + Meteor.userId() + 'country');
        Modules.both.getUserInfo(profile, stringId);
        return Session.get(stringId).profile.country.name + ' ' + Modules.client.searchJSON(geoJSON.country, Session.get(stringId).profile.country.name)[0].emoji;
        //return TAPi18n.__('digital-citizen');
      }
    }
  }
})

Template.avatar.events({
  'change input[type="file"]' ( event, template ) {
    Modules.client.uploadToAmazonS3( { event: event, template: template } );
  },
  'click #toggleEditor': function () {
    var data = Meteor.user().profile;
    data.configured = false;
    Meteor.users.update(Meteor.userId(), { $set: { profile : data }})
  }
});
