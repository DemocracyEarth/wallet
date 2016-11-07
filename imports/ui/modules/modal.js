import { Session } from 'meteor/session';

const modal = (active, settings, callback) => {
  Session.set('displayModal', settings);
  Session.set('showModal', active);

  if (callback !== undefined) {
    export const modalCallback = callback;
  }
};

export const displayModal = modal;
