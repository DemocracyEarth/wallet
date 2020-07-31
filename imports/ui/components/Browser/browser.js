import { Template } from 'meteor/templating';

import Browser from '/imports/ui/components/Browser/Browser.jsx';

import '/imports/ui/components/Browser/browser.html';

Template.browser.helpers({
  Browser() {
    return Browser;
  },
});

