// These are custom hooks into the runner.
// See https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/event_handlers.md

import {getBaseUrl, logs} from './utils';

if (global.context) throw new Error("Something is fishy. Context should not be defined already.");
global.context = {}; // global context object, reset before each Scenario

export default function () {

  console.log("Setting up the hooks…"); // :(|) oook?

  // http://webdriver.io/guide/testrunner/timeouts.html
  exports.config = {
    waitforTimeout: 10000
  };

  // Load Chai extensions, because life is simpler with them.
  // See http://chaijs.com/plugins/ for more extensions.
  // Note: browser and server are unavailable here
  this.BeforeFeatures(() => {
    if (typeof chai == 'undefined') throw new Error("We're using Chai ; please run Chimp with the --chai option.");
    chai.use(require('chai-string'));
  });

  // Allows us to print the log messages BELOW the step definition. See `log` in `./utils.js`.
  this.AfterStep(() => {
    try {
      logs.forEach((s) => console.log(s));
      logs.length = 0;
    } catch (e) {
      console.error("Failed to print the logs.", logs);
    }
  });

  // Swipe the slate clean before each scenario.
  this.BeforeScenario(() => {
    if (browser.getUrl() == 'data:,') { browser.url(getBaseUrl()); } // Visit the website, or Meteor is undefined

    fixtures.common.reset(); // Reset the database, and re-add the mandatory fixtures, like the Collective
    context = {}; // Reset the scenario-scoped context global variable
  });

};
