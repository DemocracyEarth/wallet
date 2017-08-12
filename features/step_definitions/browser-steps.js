
import { log, fail, getServer } from './support/utils';
import { visit, getBrowser } from './support/browser';

const findOneDomElement  = (name) => {
    let element = null;

    // todo : if name has spaces in it, make it camelCase or snake_case or union-case

    const elementsById = getBrowser().elements(`#${name}`).value;
    if (elementsById.length > 0) {
        if (elementsById.length > 1) { fail(`There is more than one DOM element with the id '${name}'.`) }
        element = elementsById[0];
    }

    return element;
};

export default function () {

    this.Given(/^I am on the homepage$/, () => {
        visit('/');
    });

    this.When(/^I trigger the floating action button$/, () => {
        widgets.fab.click();
    });

    this.Then(/^I (?:wait|pause) (?:for )?(\d+(?:\.\d*)?) ?s(?:econds?)?$/, (seconds) => {
        getBrowser().pause(parseFloat(seconds) * 1000);
    });

    this.When(/^I fill the (.+) with "(.*)"$/, (elementQuery, content) => {
        let element = findOneDomElement(elementQuery);

        if ( ! element) { fail(`Could not find any editable DOM element for query '${name}'.`); }

        if (element.getAttribute("contenteditable")) {
            element.click();
            element.keys(content);
        } else {  // todo : add support for input fields
            fail(`DOM element found for query '${name}' is not a contenteditable.`);
        }
    });

};
