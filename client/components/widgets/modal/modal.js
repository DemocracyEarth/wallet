Template.modal.helpers({
  showModal: function () {
    return Session.get('showModal');
  }
});

Template.modalWindow.rendered = function () {
  //Initial position
  paddingTotal = parseInt($('.alert').css('padding-bottom')) + parseInt($('.alert').css('padding-top'));
  var alertHeight = parseInt( (window.innerHeight / 2) - ( ($('.alert').height() + paddingTotal) / 2));

  //Intro animation
  $('.alert').css('margin-top', alertHeight + 'px');
  $('.alert').css('opacity', '0');
  $('.alert').velocity({'opacity': '1'}, Modules.client.animationSettings);

  //Exit animation

};

Template.modalWindow.helpers({
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

Template.modalWindow.events({
  'click #modalToggle': function () {
    //Modules.client.displayModal(false);
  },
  'click #cancel': function (event, sessionVar) {
    Session.set('showModal', false);
    Modules.client.displayModal(false);
  },
  'click #execute': function (event) {
    Modules.client.modalCallback();
    Session.set('showModal', false);
    Modules.client.displayModal(false);
  }
})
