import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

const Files = new Mongo.Collection('files');

Meteor.publish('files', function files() {
  const data = Files.find({ userId: this.userId });
  if (data) {
    return data;
  }
  return this.ready();
});
