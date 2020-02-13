import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { Slingshot } from 'meteor/edgee:slingshot';

import { displayNotice } from './notice';
import { animate } from './animation';

let template;

const _getFileFromInput = (event) => {
  return event.target.files[0];
};

const _setPlaceholderText = (string = TAPi18n.__('upload-picture')) => {
  template.find('.uploader-button').innerText = string;
};

const _addUrlToDatabase = (url) => {
  Meteor.call('storeUrlInDatabase', url, (error) => {
    if (error) {
      displayNotice(error.reason, true);

      _setPlaceholderText();
    } else {
      // Success
      const data = Meteor.user().profile;
      displayNotice(TAPi18n.__('new-profile-pic'), true);
      _setPlaceholderText();
      data.picture = url;
      Meteor.users.update(Meteor.userId(), { $set: { profile: data } });
    }
  });
};


const _uploadFileToAmazon = (file) => {
  const uploader = new Slingshot.Upload('uploadToAmazonS3');

  uploader.send(file, (error, url) => {
    if (error) {
      displayNotice(error.message, true);

      _setPlaceholderText();
    } else {
      _addUrlToDatabase(url);
    }
  });
};

const upload = (options) => {
  template = options.template;
  const file = _getFileFromInput(options.event);

  _setPlaceholderText(TAPi18n.__('uploading'));
  _uploadFileToAmazon(file);
};


const URLStatus = (sessionVar) => {
  switch (Session.get(sessionVar)) {
    case 'VERIFY':
      return TAPi18n.__('url-verify');
    case 'UNAVAILABLE':
      return TAPi18n.__('url-unavailable');
    case 'AVAILABLE':
      return TAPi18n.__('url-available');
    default:
      return 'invalid-value';
  }
};

const verifierMode = (sessionVar) => {
  switch (Session.get(sessionVar)) {
    case 'VERIFY':
      animate($('.state'), 'tilt', { loop: true, duration: 750 });
      return 'verifying';
    case 'UNAVAILABLE':
      animate($('.state'), 'fade-in');
      return 'unavailable';
    case 'AVAILABLE':
      animate($('.state'), 'fade-in');
      return 'available';
    default:
      return 'hide';
  }
};

export const URLCheck = URLStatus;
export const URLVerifier = verifierMode;
export const uploadToAmazonS3 = upload;
