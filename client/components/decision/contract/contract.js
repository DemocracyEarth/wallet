Template.contract.helpers({
  editorMode: function () {
    return (Session.get('contract').stage == 'DRAFT');
  },
  isDelegation: function () {
    return (Session.get('contract').kind == 'DELEGATION');
  }
})
