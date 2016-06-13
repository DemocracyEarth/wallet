let modal = (active, settings ) => {

  if (Session.get('displayModal') == undefined) {
    Session.set('displayModal', {
      //Default values 
      icon    : 'images/author-signature.png',
      title   : 'proposal-author',
      message : 'proposal-signed-identity',
      cancel  : 'not-now',
      action  : 'sign-proposal',
      visible : active
    })
  } else {
    var settings = Session.get('displayModal');
    settings.visible = active;
    Session.set('displayModal', settings)
  }

  Session.set('displayModal', settings);

};

Modules.client.displayModal = modal;
