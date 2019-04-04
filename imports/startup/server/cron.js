import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/littledata:synced-cron';

SyncedCron.add({
  name: 'Testing vote decay',
  schedule: (parser) => {
    // parser is a later.parse object
    return parser.text('every 5 minutes');
  },
  job: (intendedAt) => {
    console.log('crunching numbers');
    console.log('job should be running at:');
    console.log(intendedAt);
  },
});


Meteor.startup(() => {
  SyncedCron.start();
});
