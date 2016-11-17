import { Mongo } from 'meteor/mongo';

export const Files = new Mongo.Collection('files');

/*
*  FIX: temporary workaround
*  TBD: apply security best practices
*  All to methods, validate paramenters
*/
Files.allow({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  },
});
