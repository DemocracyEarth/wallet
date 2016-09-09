Template.avatar.rendered = function () {
  Session.set('editor', false);
}

Template.avatar.helpers({
  roleStatus: function () {
    return roleStatus(Session.get('contract').signatures, this.profile);
  },
  pending: function () {
    if (Session.get('contract').kind == 'DELEGATION') {
      if (this.includeRole) {
        if (roleStatus(Session.get('contract').signatures, this.profile, true)) {
          return 'pending';
        } else {
          return '';
        };
      }
    }
  },
  elementId: function () {
    return Modules.both.guidGenerator();
  },
  classStyle: function (smallFont) {
    var style = new String();
    if (smallFont) {
      style = 'identity-small';
    } else {
      style = '';
    }

    if (this.disabled == true) {
      style += ' profile-pic-disabled';
    }

    return style;
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
        if (Session.get(stringId) != undefined) {
          return Session.get(stringId).profile.picture;
        }
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

        if (Session.get(stringId) != undefined) {
          return Modules.client.showFullName(Session.get(stringId).profile.firstName, Session.get(stringId).profile.lastName);
        }
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
        if (profile.country.name != TAPi18n.__('unknown')) {
          return profile.country.name + ' ' + Modules.client.searchJSON(geoJSON.country, profile.country.name)[0].emoji;
        } else {
          return TAPi18n.__('unknown');
        }
      } else {
        //it's a user id.
        var stringId = new String(profile + Meteor.userId() + 'country');
        Modules.both.getUserInfo(profile, stringId);
        if (Session.get(stringId) != undefined) {
          if (Session.get(stringId).profile.country.name != TAPi18n.__('unknown')) {
            return Session.get(stringId).profile.country.name + ' ' + Modules.client.searchJSON(geoJSON.country, Session.get(stringId).profile.country.name)[0].emoji;
          } else {
            return TAPi18n.__('unknown');
          }
        } else {
          return TAPi18n.__('digital-citizen');
        }
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
  },
  'mouseenter .profile-pic': function (event) {
    if (this.displayPopup != false && this.disabled != true) {
      if (this.profile != null && this.profile != undefined) {
        Modules.client.displayPopup(event.target, true, 'card', this.profile);
      }
    }
  },
  'mouseleave .profile-pic': function (event) {
    if (!Session.get('displayPopup')) {
      Modules.client.cancelPopup();
    }
  }
});

function roleStatus (signatures, profile, getPending) {
  var status = new String();
  var pending = new Boolean(false);
  for (var i = 0; i < signatures.length; i++) {
    if (signatures[i]._id == profile) {
      switch (signatures[i].role) {
        case 'DELEGATOR':
          status = '<strong>' + TAPi18n.__('delegator') + '</strong>';
          break;
        case 'DELEGATE':
          status = '<strong>' + TAPi18n.__('delegate') + '</strong>';
          break;
      }
      switch (signatures[i].status) {
        case 'PENDING':
          status += ' - ' + TAPi18n.__('signature-pending');
          pending = true;
          break;
        case 'REJECTED':
          status += ' - ' + TAPi18n.__('signature-rejected');
          pending = true;
          break;
        default:
          pending = false;
          break;
      }
      break;
    }
  }
  if (getPending == undefined || getPending == false) {
    return status;
  } else {
    return pending;
  }
}
