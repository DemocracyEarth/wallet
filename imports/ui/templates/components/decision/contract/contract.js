Template.contract.helpers({
  editorMode: function () {
    if (Session.get('contract')) {
      return (Session.get('contract').stage == STAGE_DRAFT);
    }
  },
  isDelegation: function () {
    if (Session.get('contract')) {
      return (Session.get('contract').kind == 'DELEGATION');
    }
  },
  pollClosed: function () {
    if (Session.get('contract')) {
      return (Session.get('contract').stage == STAGE_FINISH);
    }
  }
})
