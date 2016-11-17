import { Meteor } from 'meteor/meteor';
import { Files } from '../Files';

Meteor.publish('files', function files() {
  const data = Files.find({ userId: this.userId });
  if (data) {
    return data;
  }
  return this.ready();
});
