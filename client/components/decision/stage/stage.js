Template.stage.helpers({
  text: function () {
    switch(this.text) {
      case STAGE_DRAFT:
        return TAPi18n.__('kind-draft-vote');
      case STAGE_LIVE:
        var ticker = Modules.client.countdown(this.closingDate);

        if (ticker != false) {
          return ticker;
        } else {

          return TAPi18n.__('poll-closed')

        }
      case STAGE_FINISH:
        switch(this.executionStatus) {
          case EXECUTION_STATUS_APPROVED:
            return TAPi18n.__('kind-finish-vote-approved');
          case EXECUTION_STATUS_ALTERNATIVE:
            return TAPi18n.__('kind-finish-vote-alternative');
          case EXECUTION_STATUS_REJECTED:
            return TAPi18n.__('kind-finish-vote-rejected');
        }
    }
  },
  style: function (stage, executionStatus) {
    switch (this.text) {
      case STAGE_DRAFT:
        return 'stage-draft';
      case STAGE_LIVE:
        return 'stage-live';
      case STAGE_FINISH:
        switch(this.executionStatus) {
          case EXECUTION_STATUS_APPROVED:
            return 'stage-finish-approved';
          case EXECUTION_STATUS_ALTERNATIVE:
            return 'stage-finish-alternative';
          case EXECUTION_STATUS_REJECTED:
            return 'stage-finish-rejected';
        }
    }
  }
})
