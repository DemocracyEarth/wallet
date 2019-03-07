import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { Router } from 'meteor/iron:router';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';

import { geo } from '/lib/geo';
import { signatureStatus, removeSignature } from '/imports/startup/both/modules/Contract';
import { guidGenerator } from '/imports/startup/both/modules/crypto';
import { getAnonymous } from '/imports/startup/both/modules/User';
import { showFullName } from '/imports/startup/both/modules/utils';
import { searchJSON } from '/imports/ui/modules/JSON';
import { uploadToAmazonS3 } from '/imports/ui/modules/Files';
import { displayModal } from '/imports/ui/modules/modal';
import { templetize, getImage } from '/imports/ui/templates/layout/templater';
import { displayPopup, cancelPopup } from '/imports/ui/modules/popup';

import '/imports/ui/templates/components/identity/avatar/avatar.html';
import '/imports/ui/templates/components/identity/chain/chain.js';

/**
* @summary subscribes to user data
* @param {object} user user to parse
* @param {object} instance template running this
* @param {function} callback when ready take this action
* @returns {string} country
*/
const _getUser = (userId) => {
  const avatarList = Session.get('avatarList');
  if (userId && avatarList) {
    if (!_.contains(avatarList, userId)) {
      avatarList.push(userId);
      Session.set('avatarList', avatarList);
    }
  } else if (userId) {
    Session.set('avatarList', [userId]);
  }
};

/**
* @summary gets address info from user
* @param {object} user user to parse
*/
const _getAddress = (user) => {
  let reserve;
  if (!user.profile) {
    reserve = Meteor.user().profile.wallet.reserves;
  } else if (typeof user.profile === 'string') {
    const userProfile = Meteor.users.findOne({ _id: user.profile });
    if (userProfile && userProfile.profile.wallet.reserves) {
      reserve = userProfile.profile.wallet.reserves;
    }
  } else if (user.wallet && user.wallet.reserves) {
    reserve = user.wallet.reserves;
  }
  if (reserve && reserve.length && reserve.length > 0) {
    for (const i in reserve) {
      if ((reserve[i].token === 'WEI' || reserve[i].token === 'STX') && reserve[i].publicAddress) {
        return reserve[i];
      }
    }
  }
  return undefined;
};

/**
* @summary describes nationality of user in ux
* @param {object} profile user to parse
* @param {boolean} flagOnly just show emoji
* @param {boolean} nameOnly just show name
* @param {boolean} codeOnly just show code
* @returns {string} country
*/
const getNation = (profile, flagOnly, nameOnly, codeOnly) => {
  if (profile === undefined) {
    if (Meteor.user() != null) {
      if (Meteor.user().profile.country !== undefined) {
        const country = searchJSON(geo.country, Meteor.user().profile.country.name);
        if (country !== undefined) {
          if (flagOnly) {
            return `${country[0].emoji}`;
          }
          if (nameOnly) {
            return `${country[0].name}`;
          }
          if (codeOnly) {
            return `${country[0].code}`;
          }
          return `${Meteor.user().profile.country.name} ${country[0].emoji}`;
        }
      }
      if (flagOnly || nameOnly || codeOnly) { return ''; }
      return TAPi18n.__('digital-citizen');
    }
  } else if (profile.country !== undefined) {
    if (profile.country.name !== TAPi18n.__('unknown')) {
      if (flagOnly) {
        return `${searchJSON(geo.country, profile.country.name)[0].emoji}`;
      }
      if (nameOnly) {
        return `${searchJSON(geo.country, profile.country.name)[0].name}`;
      }
      if (codeOnly) {
        return `${searchJSON(geo.country, profile.country.name)[0].code}`;
      }
      return `${profile.country.name} ${searchJSON(geo.country, profile.country.name)[0].emoji}`;
    }
    if (flagOnly) { return ''; }
    return TAPi18n.__('unknown');
  } else {
    let user = Meteor.users.findOne({ _id: profile });
    if (user === undefined) { user = getAnonymous(); }
    if (user !== undefined && user.profile.country !== undefined) {
      const country = searchJSON(geo.country, user.profile.country.name);
      if (user.profile.country.name !== TAPi18n.__('unknown') && country !== undefined) {
        if (flagOnly) {
          return `${country[0].emoji}`;
        }
        if (nameOnly) {
          return user.profile.country.name;
        }
        if (codeOnly) {
          return user.profile.country.code;
        }
        return `${user.profile.country.name} ${country[0].emoji}`;
      }
      if (flagOnly || nameOnly || codeOnly) { return ''; }
      return TAPi18n.__('unknown');
    }
  }
  if (flagOnly || nameOnly || codeOnly) { return ''; }
  return TAPi18n.__('digital-citizen');
};

/**
* @summary generates a query to get user data based on dynamic ways of calling avatar template
* @returns {object} with key and value to be used for collection query.
*/
const _getDynamicID = (data) => {
  if (data) {
    if (!data.username) {
      if (!data._id) {
        if (data.profile) {
          if (data.profile._id) {
            return {
              _id: data.profile._id,
            };
          }
          return {
            _id: data.profile,
          };
        }
      }
      return {
        _id: data._id,
      };
    }
    return {
      username: data.username,
    };
  }
  return undefined;
};

Template.avatar.onCreated(function () {
  const instance = this;

  _getUser(_getDynamicID(instance.data)._id);

  Template.instance().imageTemplate = new ReactiveVar();
  templetize(Template.instance());
});

Template.avatar.onRendered = () => {
  Session.set('editor', false);
};

// this turned out to be kinda polymorphic
Template.avatar.helpers({
  url() {
    if (this.profile === undefined) {
      if (Meteor.user()) {
        return `/@${Meteor.user().username}`;
      }
    }
    const user = Meteor.users.findOne(_getDynamicID(this));
    if (!user) {
      return '#';
    }
    return `/@${user.username}`;
  },
  myself() {
    if (this.profile === undefined) {
      if (Meteor.user()) {
        return true;
      }
    } else if (!this.username) {
      if (!this._id) {
        if (this.profile._id) {
          return (this.profile._id === Meteor.user()._id);
        }
        return (this.profile === Meteor.user()._id);
      }
      return (this._id === Meteor.user()._id);
    }
    return (this.username === Meteor.user().username);
  },
  roleStatus() {
    return signatureStatus(Session.get('contract').signatures, this.profile);
  },
  roleStyle() {
    let label;
    if (!Meteor.Device.isPhone()) {
      switch (signatureStatus(Session.get('contract').signatures, this.profile, true)) {
        case 'CONFIRMED':
          label = 'signature-confirmed';
          break;
        case 'REJECTED':
          label = 'signature-rejected';
          break;
        default:
          label = '';
      }
    } else {
      label = ' signature-role-mobile';
    }
    return label;
  },
  includeRole() {
    if (Session.get('contract')) {
      if (Session.get('contract').signatures === undefined) {
        return false;
      }
    }
    return this.includeRole;
  },
  pending() {
    if (Session.get('contract') !== undefined) {
      if (Session.get('contract').kind === 'DELEGATION') {
        if (this.includeRole) {
          if (signatureStatus(Session.get('contract').signatures, this.profile, true) === 'PENDING') {
            return 'pending';
          }
          return '';
        }
      }
    }
    return '';
  },
  elementId() {
    return guidGenerator();
  },
  classStyle(smallFont) {
    let style = '';

    if (smallFont) {
      style = 'identity-small';
    }
    if (this.disabled) {
      style += ' profile-pic-disabled';
    }
    if (this.loginMode) {
      style += ' profile-pic-login';
    }
    return style;
  },
  profilePicture(profile) {
    if (profile === undefined) {
      if (Meteor.user()) {
        if (Meteor.user().profile.picture === undefined) {
          return `${Router.path('home')}images/noprofile.png`;
        }
        return Meteor.user().profile.picture;
      }
    } else {
      if (profile.picture !== undefined) {
        return profile.picture;
      }
      let user = Meteor.users.findOne({ _id: profile });
      if (user === undefined) {
        user = getAnonymous();
      }
      return user.profile.picture;
    }
    return undefined;
  },
  pictureSize(size, includeName) {
    let style = '';
    if (size !== undefined) {
      style = `width:${size}px; height:${size}px; `;
    }
    if (includeName === false && !this.loginMode) {
      style += 'float: none; ';
    }
    if (this.imgStyle) {
      style += ` ${this.imgStyle}`;
    }
    return style;
  },
  fullName(profile) {
    if (profile === undefined) {
      if (Meteor.user()) {
        if (Meteor.user().profile.firstName !== undefined) {
          const firstname = Meteor.user().profile.firstName;
          const lastName = Meteor.user().profile.lastName;
          const username = Meteor.user().username;
          return showFullName(firstname, lastName, username);
        }
        return Meteor.user().username;
      }
    } else if (profile.firstName !== undefined) {
      return showFullName(profile.firstName, profile.lastName, profile.username);
    } else {
      let user = Meteor.users.findOne({ _id: profile });
      if (user === undefined) { user = getAnonymous(); }
      return showFullName(user.profile.firstName, user.profile.lastName, user.username);
    }
    return undefined;
  },
  username(profile) {
    if (profile === undefined) {
      if (Meteor.user()) {
        return Meteor.user().username;
      }
    }
    const user = Meteor.users.findOne(_getDynamicID(this));
    if (!user) {
      return '';
    }
    return `${user.username}`;
  },
  nationality(profile) {
    return getNation(profile);
  },
  flag(profile) {
    return getNation(profile, true);
  },
  geoURL(profile) {
    return `${Router.path('home')}${getNation(profile, false, false, true).toLowerCase()}`;
  },
  sidebarIcon() {
    if (this.sidebar) {
      return 'avatar-icon-box';
    }
    return '';
  },
  styleContext() {
    if (this.loginMode) {
      return 'float:left';
    }
    return '';
  },
  ticker() {
    const reserve = _getAddress(this);
    if (reserve) {
      return reserve.token;
    }
    return '';
  },
  address() {
    const reserve = _getAddress(this);
    if (reserve) {
      return reserve.publicAddress;
    }
    return '';
  },
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
});

Template.avatar.events({
  'change input[type="file"]'(event, instance) {
    uploadToAmazonS3({ event, template: instance });
  },
  'click #toggleEditor'() {
    const data = Meteor.user().profile;
    data.configured = false;
    Meteor.users.update(Meteor.userId(), { $set: { profile: data } });
    Session.set('cardNavigation', true);
  },
  'click #removeSignature'() {
    if (Meteor.Device.isPhone()) {
      $('#post-editor').css('top', '0px');
    }
    displayModal(
      true,
      {
        icon: 'images/author-signature.png',
        title: TAPi18n.__('remove-signature'),
        message: TAPi18n.__('remove-signature-message'),
        cancel: TAPi18n.__('not-now'),
        action: TAPi18n.__('remove'),
        displayProfile: false,
      },
      () => {
        removeSignature(Session.get('contract')._id, Meteor.user()._id);
        Session.set('userSigned', false);
      }
    );
  },
  'mouseenter .profile-pic'(event) {
    if (this.displayPopup !== false && this.disabled !== true && this.profile !== null && this.profile !== undefined) {
    // displayPopup(event.target, 'card', this.profile, 'mouseenter', `popup-avatar-${this.profile}`);
    }
  },
  'mouseleave .profile-pic'() {
    if (this.displayPopup !== false && this.disabled !== true && this.profile !== null && this.profile !== undefined) {
    // cancelPopup(`popup-avatar-${this.profile}`);
    }
  },
});

export const getFlag = getNation;
export const getUser = _getUser;
