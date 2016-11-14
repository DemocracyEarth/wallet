Template.contract.helpers({
  editorMode: function () {
    if (Session.get('contract')) {
      return (Session.get('contract').stage == STAGE_DRAFT);
    }
  },
  isDelegation: function () {
    if (Session.get('contract')) {
      return (Session.get('contract').kind == KIND_DELEGATION);
    }
  },
  pollClosed: function () {
    if (Session.get('contract')) {
      return (Session.get('contract').stage == STAGE_FINISH);
    }
  },
  ballotToggle: function () {
    if (Session.get('contract')) {
      if (Session.get('contract').ballotEnabled == false) {
        return 'paper-empty';
      }
    }
  }
})
