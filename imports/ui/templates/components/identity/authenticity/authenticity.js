import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { Router } from 'meteor/iron:router';

import { signatureStatus, removeSignature } from '/imports/startup/both/modules/Contract';
import { guidGenerator } from '/imports/startup/both/modules/crypto';
import { getAnonymous } from '/imports/startup/both/modules/User';
import { showFullName } from '/imports/startup/both/modules/utils';
import { searchJSON } from '/imports/ui/modules/JSON';
import { uploadToAmazonS3 } from '/imports/ui/modules/Files';
import { displayModal } from '/imports/ui/modules/modal';
import { displayPopup, cancelPopup } from '/imports/ui/modules/popup';
import { globalObj } from '/lib/global';

import './authenticity.html';

Template.authenticity.onRendered = () => {
  console.log('authenticity');
};
