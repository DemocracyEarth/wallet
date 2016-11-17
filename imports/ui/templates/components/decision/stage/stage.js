import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';

import { countdown } from '/imports/ui/modules/chronos';
import './stage.html';

Template.stage.helpers({
  text: function () {
    switch(this.text) {
      case 'DRAFT':
        return TAPi18n.__('kind-draft-vote');
      case 'LIVE':
        var ticker = countdown(this.closingDate);
        if (ticker != false) {
          return ticker;
        } else {
          return TAPi18n.__('poll-closed')
        }
      case 'FINISH':
        switch(this.executionStatus) {
          case 'APPROVED':
            return TAPi18n.__('kind-finish-vote-approved');
          case 'ALTERNATIVE':
            return TAPi18n.__('kind-finish-vote-alternative');
          case 'REJECTED':
            return TAPi18n.__('kind-finish-vote-rejected');
          case 'VOID':
            return TAPi18n.__('kind-finish-vote-void');
        }
    }
  },
  style: function (stage, executionStatus) {
    switch (this.text) {
      case 'DRAFT':
        return 'stage-draft';
      case 'LIVE':
        return 'stage-live';
      case 'FINISH':
        switch(this.executionStatus) {
          case 'APPROVED':
            return 'stage-finish-approved';
          case 'ALTERNATIVE':
            return 'stage-finish-alternative';
          case 'REJECTED':
            return 'stage-finish-rejected';
          case 'VOID':
            return 'stage-draft';
        }
    }
  }
})
