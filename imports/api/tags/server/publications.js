import { Meteor } from 'meteor/meteor';
import { Tags } from '../Tags';

Meteor.publish('tags', () =>
  Tags.find()
);
