let modal = (active, settings, callback) => {
  Session.set('displayModal', settings);
  Session.set('showModal', active);

  if (callback != undefined) {
    Modules.client.modalCallback = callback;
  }

};

Modules.client.displayModal = modal;
