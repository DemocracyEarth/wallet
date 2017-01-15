
import { log } from './support/utils';
import { visit, getBrowser } from './support/browser';

export default function () {

    this.Given(/^I am on the homepage$/, () => {
        visit('/');
    });

    this.When(/^I trigger the floating action button$/, () => {
        widgets.fab.click();
    });

    this.Then(/^I wait (?:for )?(\d+(?:\.\d*)?) ?s(?:econds?)?$/, (seconds) => {
        getBrowser().pause(parseFloat(seconds) * 1000)
    });

};
