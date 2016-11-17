import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';

import './kind.html';

Template.kind.helpers({
  text: function() {
      let kind = Session.get('contract').kind;
      switch(kind) {
        case 'VOTE':
          Session.set('kind', kind.toLowerCase());
          switch (Session.get('contract').stage) {
            case 'DRAFT':
              Session.set('stage', 'draft');
              return TAPi18n.__('kind-draft-vote');
              break;
            case 'LIVE':
              Session.set('stage', 'live');
              return TAPi18n.__('kind-live-vote');
              break;
            case 'FINISH':
              Session.set('stage', 'finish-approved');
              return TAPi18n.__('kind-finish-vote-approved');
              break;
            case 'ALTERNATIVE':
              Session.set('stage', 'finish-alternative');
              return TAPi18n.__('kind-finish-vote-alternative');
              break;
            case 'REJECTED':
              Session.set('stage', 'finish-rejected');
              return TAPi18n.__('kind-finish-vote-rejected');
              break;
          }
          break;
        default:
          return 'TBD';
      }
  },
  style() {
    return 'stage stage-' + Session.get('stage');
  },
  executionStatus() {
    return Session.get('contract').executionStatus;
  },
  closingDate() {
    return Session.get('contract').closingDate;
  },
  stage() {
    return Session.get('contract').stage;
  }
});
