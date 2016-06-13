Template.modal.rendered = function () {
  console.log(this.firstNode);
};

Template.modal.helpers({
  icon: function () {
    if (Session.get('displayModal') != undefined) {
      return Session.get('displayModal').icon;
    }
  },
  title: function () {
    if (Session.get('displayModal') != undefined) {
      return Session.get('displayModal').title;
    }
  },
  message: function () {
    if (Session.get('displayModal') != undefined) {
      return Session.get('displayModal').message;
    }
  },
  cancel: function () {
    if (Session.get('displayModal') != undefined) {
      return Session.get('displayModal').cancel;
    }
  },
  action: function () {
    if (Session.get('displayModal') != undefined) {
      return Session.get('displayModal').action;
    }
  },
  isAuthorization: function () {
    if (Session.get('displayModal') != undefined) {
      return Session.get('displayModal').isAuthorization;
    }
  },
  visible: function () {
    if (Session.get('displayModal') != undefined) {
      if (Session.get('displayModal').visible == true) {
        return '';
      }
    }
    return 'hide';
  }
});

Template.modal.events({
  'click #modalToggle': function () {
    //Modules.client.displayModal(false);
  },
  'click #cancel': function (event, sessionVar) {
    Modules.client.displayModal(false);
  },
  'click #execute': function (event) {
    Modules.client.modalCallback();
    Modules.client.displayModal(false);
  }
})
