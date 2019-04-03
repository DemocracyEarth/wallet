import { Meteor } from 'meteor/meteor';
import { SyncedCron } from 'meteor/littledata:synced-cron';


// ################### - TEST #1

function _doSomething() {
  console.log('cron.js - DO SOMETHING');
  Meteor.logout();
}

if (Meteor.isServer) {
  // optionally set the collection's name that synced cron will use
  SyncedCron.config({
    log: true,
  });

  SyncedCron.add({
    name: 'Testig vote decay',
    schedule: function (parser) {
      // parser is a later.parse object
      return parser.text('every 5 seconds');
    }, 
    job: function (intendedAt) {
      console.log('crunching numbers');
      console.log('job should be running at:');
      console.log(intendedAt);
      _doSomething();
    }
  });

  Meteor.startup(function () {
    // code to run on server at startup
    SyncedCron.start();

    // Stop jobs after 15 seconds
    Meteor.setTimeout(function () { SyncedCron.stop(); }, 15 * 1000);
  });
}

// ################### - TEST #2

// SyncedCron.config({
//   log: true,
// });

// SyncedCron.add({
//   name: 'Testing vote decay',
//   schedule: function (parser) {
//     // parser is a later.parse object
//     return parser.text('every 5 seconds');
//   },
//   job: function (intendedAt) {
//     console.log('crunching numbers');
//     console.log('job should be running at:');
//     console.log(intendedAt);
//     Meteor.logout();
//   },
// });

// ################### - TEST #3

// SyncedCron.add({
//   name: 'Testing vote decay',
//   schedule: (parser) => {
//     // parser is a later.parse object
//     return parser.text('every 5 seconds');
//   },
//   job: (intendedAt) => {
//     console.log('crunching numbers');
//     console.log('job should be running at:');
//     console.log(intendedAt);
//     Meteor.logout();
//   },
// });

// SyncedCron.start();

// ################### - TEST #4

// Meteor.startup(() => {
//   SyncedCron.start();
//   // Meteor.setTimeout(function () { SyncedCron.stop(); }, 15 * 1000);
// });

// Meteor.startup(() => {
//   SyncedCron.config({
//     log: true,
//   });

//   SyncedCron.add({
//     name: 'Testing vote decay',
//     schedule: (parser) => {
//       // parser is a later.parse object
//       return parser.text('every 5 seconds');
//     },
//     job: (intendedAt) => {
//       console.log('crunching numbers');
//       console.log('job should be running at:');
//       console.log(intendedAt);
//       Meteor.logout();
//     },
//   });

//   SyncedCron.start();
//   // Stop jobs after 15 seconds
//   // Meteor.setTimeout(function () { SyncedCron.stop(); }, 15 * 1000);
// });
