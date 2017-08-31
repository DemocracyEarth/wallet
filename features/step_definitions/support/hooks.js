// These are custom hooks into the runner.
// See https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/event_handlers.md

import {logs} from './utils';

global.context = {};

export default function () {

  console.log("Setting up the hooks…"); // :(|) oook?

  // Load Chai extensions, because life is simpler with them.
  // See http://chaijs.com/plugins/ for more extensions.
  this.BeforeFeatures(() => {
    if (typeof chai == 'undefined') throw new Error("We're using Chai ; please run Chimp with the --chai option.");
    chai.use(require('chai-string'));
  });

  // Allows us to print the log messages BELOW the step definition. See `log` in `./utils.js`.
  this.AfterStep(() => {
    logs.forEach((s) => console.log(s));
    logs.length = 0;
  });

  // Swipe the slate clean before each scenario.
  this.BeforeScenario(() => {
    fixtures.common.reset();
    this.I = null; // nope nope nope ; we need a better way to have a scenario-scoped context.
    this.context = {}; // maybe something like this ?
    context = {}; // or like this, so we don't need the `this` to access it ? The evils are similar, no ?
  });

};