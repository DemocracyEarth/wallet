import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { displayNotice } from './notice';
import { animate } from './animation';

let template;

let _getFileFromInput = (event) => {
  return event.target.files[0];
};

let _setPlaceholderText = (string = TAPi18n.__('upload-picture')) => {
  template.find('.uploader-button').innerText = string;
};

let _addUrlToDatabase = (url) => {
  Meteor.call('storeUrlInDatabase', url, (error) => {
    if (error) {
      displayNotice(error.reason, true);

      _setPlaceholderText();
    } else {
      //Success
      var data = Meteor.user().profile;
      displayNotice(TAPi18n.__('new-profile-pic'), true);
      _setPlaceholderText();
      data.picture = url;
      Meteor.users.update(Meteor.userId(), { $set: { profile : data }})
    }
  });
};


let _uploadFileToAmazon = ( file ) => {
  const uploader = new Slingshot.Upload( "uploadToAmazonS3" );

  uploader.send(file, (error, url) => {
    if (error) {
      displayNotice(error.message, true);

      _setPlaceholderText();
    } else {
      _addUrlToDatabase(url);
    }
  });
};

let upload = (options) => {
  template = options.template;
  let file = _getFileFromInput(options.event);

  _setPlaceholderText(TAPi18n.__('uploading'));
  _uploadFileToAmazon(file);
};


let URLStatus = (sessionVar) => {
  switch (Session.get(sessionVar)) {
    case "VERIFY":
      return TAPi18n.__('url-verify');
      break;
    case "UNAVAILABLE":
      return TAPi18n.__('url-unavailable');
      break;
    case "AVAILABLE":
      return TAPi18n.__('url-available');
      break;
    default:
      return 'invalid-value';
  }
};

let verifierMode = (sessionVar) => {
  switch (Session.get(sessionVar)) {
    case "VERIFY":
      animate($('.state'), 'tilt', { loop: true, duration: 750 });
      return 'verifying';
      break;
    case "UNAVAILABLE":
      animate($('.state'), 'fade-in');
      return 'unavailable';
      break;
    case "AVAILABLE":
      animate($('.state'), 'fade-in');
      return 'available';
      break;
    default:
      return 'hide';
  }
};

export const URLCheck = URLStatus;
export const URLVerifier = verifierMode;
export const uploadToAmazonS3 = upload;
