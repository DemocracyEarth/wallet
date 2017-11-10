import { Meteor } from 'meteor/meteor';
import { Transactions } from '../Transactions';

Meteor.publish('transactions', () => {
  Transactions.find();
});
