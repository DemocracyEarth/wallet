import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/littledata:synced-cron';

SyncedCron.add({
  name: 'voteDecay',
  schedule: (parser) => {
    const interval = Meteor.settings.public.app.config.defaultRules.voteDecay.intervalFrequency;
    return parser.text(interval);
  },
  job: (intendedAt) => {
    console.log(`{ server: 'SyncedCron', initiating voteDecay job intended at: '${intendedAt}'`);
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
