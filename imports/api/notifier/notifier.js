import { Meteor } from 'meteor/meteor';

/**
* @summary notifies of transaction in personal channels
* @param {object} transaction likely to be the last ticket to parse
*/
const _notify = (transaction) => {
  let story = transaction.kind;
  let toId = transaction.output.entityId;
  let fromId = transaction.input.entityId;

  switch (transaction.kind) {
    case 'DELEGATION':
      fromId = transaction.input.delegateId;
      toId = transaction.output.delegateId;
      if (transaction.output.delegateId === Meteor.userId()) {
        story = 'REVOKE-DELEGATE';
        fromId = transaction.output.delegateId;
        toId = transaction.input.delegateId;
      }
      break;
    case 'VOTE':
      if (transaction.output.entityId === Meteor.userId()) {
        story = 'REVOKE';
        toId = transaction.input.entityId;
        fromId = transaction.output.entityId;
      }
      break;
    default:
  }

  Meteor.call(
    'sendNotification',
    toId,
    fromId,
    story,
    transaction,
  );
};

export const notify = _notify;
