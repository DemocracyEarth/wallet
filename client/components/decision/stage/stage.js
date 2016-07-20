Template.stage.helpers({
  text: function () {
    switch(this.text) {
      case 'DRAFT':
        return TAPi18n.__('kind-draft-vote');
      case 'LIVE':
        return Modules.client.countdown(this.closingDate);
      case 'FINISH':
        switch(this.executionStatus) {
          case 'APPROVED':
            return TAPi18n.__('kind-finish-vote-approved');
          case 'ALTERNATIVE':
            return TAPi18n.__('kind-finish-vote-alternative');
          case 'REJECTED':
            return TAPi18n.__('kind-finish-vote-rejected');
        }
    }
  },
  style: function (stage, executionStatus) {
    switch (stage) {
      case 'DRAFT':
        return 'stage-draft';
      case 'LIVE':
        return 'stage-live';
      case 'FINISH':
        switch(executionStatus) {
          case 'APPROVED':
            return 'stage-finish-approved';
          case 'ALTERNATIVE':
            return 'stage-finish-alternative';
          case 'REJECTED':
            return 'stage-finish-rejected';
        }
    }
  }
})
