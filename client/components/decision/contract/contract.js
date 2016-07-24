Template.contract.helpers({
  editorMode: function () {
    return (Session.get('contract').stage == 'DRAFT');
  }
})
