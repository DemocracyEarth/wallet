
import { log, fail, getServer, camelCase } from './support/utils';
import { visit, getBrowser } from './support/browser';

const findOneDomElement = (name) => {
    name = camelCase(name);

    let element = null;
    const elementsById = getBrowser().elements(`#${name}`).value;
    if (elementsById.length > 0) {
        if (elementsById.length > 1) { fail(`There is more than one DOM element with the id '${name}'.`) }
        element = elementsById[0];
    }

    return element;
};


/**
 * Compensate for the absence of element.hasClass('...') in the webdriver API.
 *
 * @param element An element from the webdriver. http://webdriver.io/api.html
 * @param classesAsString One class (eg: 'editable') or the intersection of multiple classes (eg: 'alert button').
 */
const hasClass = (element, classesAsString) => {
    const unique = (e, i, self) => { return i == self.indexOf(e); };
    const requiredClasses = classesAsString.split(' ').filter(unique);
    const existingClasses = element.getAttribute('class').split(' ').filter(unique);

    return existingClasses.concat(requiredClasses).filter(unique).length == existingClasses.length;
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

    this.When(/^I (?:fill|set) the (.+) (?:with|to) "(.*)"$/, (elementQuery, content) => {
        let element = findOneDomElement(elementQuery);

        if ( ! element) { fail(`Could not find any editable DOM element for query '${elementQuery}'.`); }

        if (element.getAttribute('contenteditable')) {
            element.click();
            element.keys(content);
        } else if (hasClass(element, 'editable')) {
          element.click();
          element.keys(content);
        } else {  // todo : add support for input fields
            fail(`DOM element found for query '${elementQuery}' seems not editable.`);
        }
    });

};
