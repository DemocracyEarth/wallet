import { Template } from 'meteor/templating';

import Dapp from '/imports/ui/components/Dapp/Dapp.jsx';

import '/imports/ui/components/Dapp/dapp.html';

Template.dapp.helpers({
  Dapp() {
    return Dapp;
  },
});

