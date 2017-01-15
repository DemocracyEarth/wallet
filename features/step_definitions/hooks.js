
// This file is not for actual step definitions, but for hooks into the runner.
// See https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/event_handlers.md

import { logs } from './support/utils';

export default function () {

    // Load Chai extensions, because life is simpler with them.
    // See http://chaijs.com/plugins/ for more extensions.
    this.BeforeFeatures(() => {
        if (typeof chai == 'undefined') throw new Error("We're using Chai ; please run Chimp with the --chai option.");
        chai.use(require('chai-string'));
    });

    // Allows us to print the log messages BELOW the step definition. See `log` in `./support/utils`.
    this.AfterStep(() => {
        logs.forEach((s) => console.log(s));
        logs.length = 0;
    });

    // Swipe the slate clean before each scenario.
    this.BeforeScenario(() => {
        fixtures.common.reset();
    });

};