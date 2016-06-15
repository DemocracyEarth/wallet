Template.modal.helpers({
  showModal: function () {
    return Session.get('showModal');
  }
});

Template.modalWindow.rendered = function () {
  //Initial position
  paddingTotal = parseInt($('.alert').css('padding-bottom')) + parseInt($('.alert').css('padding-top'));
  var alertHeight = parseInt( (window.innerHeight / 2) - ( ($('.alert').height() + paddingTotal) / 2));
  if (alertHeight > 200) {
    alertHeight = 200;
  }

  //Intro animation
  $('.alert').css('margin-top', alertHeight + 'px');
  $('.modal').css('opacity', '0');
  $('.modal').velocity({'opacity': '1'}, Modules.client.animationSettings);

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
    killModal();
  },
  'click #execute': function (event) {
    Modules.client.modalCallback();
    killModal();
  }
})

function killModal () {
  var settings = Object.assign({
    complete: function () {
      Session.set('showModal', false);
      Modules.client.displayModal(false);
    }
  }, Modules.client.animationSettings);
  $('.modal').velocity({'opacity': '0'}, settings);
}
