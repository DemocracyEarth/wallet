Template.modal.rendered = function () {

};

Template.modal.helpers({
  icon: function () {
    return Session.get('displayModal').icon;
  },
  title: function () {
    return Session.get('displayModal').title;
  },
  message: function () {
    return Session.get('displayModal').message;
  },
  cancel: function () {
    return Session.get('displayModal').cancel;
  },
  action: function () {
    return Session.get('displayModal').action;
  },
  visible: function () {
    if (Session.get('displayModal').visible == true) {
      return '';
    } else {
      return 'hide';
    }
  }
});

Template.modal.events({
  'click #modalToggle': function () {

  },
  'click #cancel': function (event, sessionVar) {
    Modules.client.displayModal(false);
  }
})
