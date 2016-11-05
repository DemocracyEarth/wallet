import { Meteor } from 'meteor/meteor';
import Contracts from '../Contracts';

Meteor.publish('contracts', () =>
  Contracts.find()
);
