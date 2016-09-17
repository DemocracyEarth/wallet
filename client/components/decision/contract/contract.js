Template.contract.helpers({
  editorMode: function () {
    return (Session.get('contract').stage == STAGE_DRAFT);
  },
  isDelegation: function () {
    return (Session.get('contract').kind == KIND_DELEGATION);
  }
})
