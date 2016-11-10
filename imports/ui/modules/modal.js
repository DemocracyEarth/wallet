import { Session } from 'meteor/session';
import { globalObj } from '/lib/global';

let modalCallback;

const modal = (active, settings, callback) => {
  Session.set('displayModal', settings);
  Session.set('showModal', active);

  if (callback !== undefined) {
    globalObj.modalCallback = callback;
  }
};

export const displayModal = modal;
export default modalCallback;
