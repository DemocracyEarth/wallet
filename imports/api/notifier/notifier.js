import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import { Contracts } from '/imports/api/contracts/Contracts';
import { Collectives } from '/imports/api/collectives/Collectives';
import { Transactions } from '/imports/api/transactions/Transactions';

/**
* @summary notifies of transaction in personal channels
* @param {object} transaction likely to be the last ticket to parse
*/
const _notify = (transaction) => {
  console.log('NOTIFYING');
  console.log(transaction);
};

export const notify = _notify;
