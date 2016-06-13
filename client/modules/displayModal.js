let modal = (active, settings, callback) => {

  if (Session.get('displayModal') == undefined) {
    Session.set('displayModal', {
      //Default values
      icon    : 'images/author-signature.png',
      title   : 'proposal-author',
      message : 'proposal-signed-identity',
      cancel  : 'not-now',
      action  : 'sign-proposal',
      isAuthorization: false,
      visible : active
    })
  } else {
    var settings = Session.get('displayModal');
    settings.visible = active;
  }

  Session.set('displayModal', settings);

  if (callback != undefined) {
    Modules.client.modalCallback = callback;
  }

};

Modules.client.displayModal = modal;
