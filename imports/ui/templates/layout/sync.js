

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

const _sync = async () => {
  console.log('syncing....');
  return await new Promise((resolve, reject) => {
    Meteor.call('getBlock', [], (error, result) => {
      if (error) { reject(error); }
      Session.set('blockTimes', result);
      return resolve(result);
    });
  });
};

export const sync = _sync;
