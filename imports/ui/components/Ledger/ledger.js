import { Template } from 'meteor/templating';

import Ledger from '/imports/ui/components/Ledger/Ledger.jsx';

import '/imports/ui/components/Ledger/ledger.html';

Template.ledger.helpers({
  Ledger() {
    return Ledger;
  },
});

