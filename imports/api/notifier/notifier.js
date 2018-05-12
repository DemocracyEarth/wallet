import { Meteor } from 'meteor/meteor';

/**
* @summary notifies of transaction in personal channels
* @param {object} transaction likely to be the last ticket to parse
*/
const _notify = (transaction) => {
  console.log('NOTIFYING');
  console.log(transaction);
  // stories:
  // delegation
  // vote to your proposal
  // a reply to your comment

  let story = transaction.kind;
  let toId = transaction.output.entityId;
  let fromId = transaction.input.entityId;

  switch (transaction.kind) {
    case 'DELEGATE':
      fromId = transaction.input.delegateId;
      toId = transaction.output.delegateId;
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
