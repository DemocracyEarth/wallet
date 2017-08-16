import {log, fail, visit, getBrowser, getServer, camelCase} from './support/utils';

/**
 * Find exactly one DOM element matching the `query`.
 * Rationale:
 *   `browser.element` will return the first(?) element matching the query if there's more than one.
 *   Most of the time we want to make sure there's no ambiguity.
 *
 * @param query A CSS-like element query
 */
const findOneDomElement = (query) => {
  const elements = getBrowser().elements(`${query}`).value;
  if (elements.length == 0) { fail(`No DOM element matching '${query}'.`) }
  if (elements.length >= 2) { fail(`There is more than one DOM element matching '${query}'.`) }

  return elements[0];
};


/**
 * Compensate for the absence of element.hasClass('...') in Chimp's API.
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


const pause = (seconds) => {
  getBrowser().pause(parseFloat(seconds) * 1000);
};


const clickOnElement = (query) => {
  try {
    getBrowser().waitForExist(query);
    getBrowser().element(query).click();
  }
  catch (e) {
    fail(`Cannot click on the element '${query}' : ${e.message}`);
  }
};


export default function () {

  this.Given(/^I am on the homepage$/, () => {
    visit('/');
  });

  this.When(/^I trigger the floating action button$/, () => {
    widgets.fab.click();
  });

  this.Then(/^I (?:wait|pause) (?:for )?(\d+(?:\.\d*)?) ?s(?:econds?)?$/, (seconds) => {
    pause(seconds);
  });

  this.When(/^I (?:fill|set) the (.+) (?:with|to) "(.*)"$/, (elementQuery, content) => {
    let element = findOneDomElement('#'+camelCase(elementQuery));
    if ( ! element) { fail(`Could not find any editable DOM element for query '${elementQuery}'.`); }

    if (element.getAttribute('contenteditable') || hasClass(element, 'editable')) {
      element.click();
      element.keys(content);
    } else {  // here, add support for input fields
      fail(`DOM element found for query '${elementQuery}' seems not editable.`);
    }
  });

  this.When(/^I add the tag (.+)$/, (tagTitle) => {
    // There has got to be a general way to create local functions wrapping a call on the server... Spread operator ?
    const tagSlug = getServer().execute((name) => {
      return require('/lib/utils').convertToSlug(name);
    }, tagTitle);
    clickOnElement(`#add-suggested-tag-${tagSlug}`);
  });

  this.When(/^I sign the idea$/, () => {
    clickOnElement('#sign-author');
    widgets.modal.confirm();
  });

  this.When(/^I submit the idea$/, () => {
    clickOnElement('a.button.execute.action-button');  // fix this with an id pls
    widgets.modal.confirm();
  });

};
