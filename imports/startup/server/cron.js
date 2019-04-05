import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/littledata:synced-cron';

SyncedCron.add({
  name: 'voteDecay',
  schedule: (parser) => {
    return parser.text('every 30 seconds');
  },
  job: (intendedAt) => {
    console.log(`voteDecay - intendedAt: ${intendedAt}`);
    Meteor.call('decayVotes', (error) => {
      if (error) {
        console.log(error, 'error running voteDecay cron job');
      }
    });
  },
});

Meteor.startup(() => {
  SyncedCron.start();
});
