import {CONSOLE_INDENT as INDENT} from './constants';



//// LOGGING ///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * We queue in here the logs for each step, and display them all in one go once the step has completed.
 * This is much better-looking than the default rendering of `console.log`.
 * @type {Array}
 */
export const logs = [];


/**
 * Log the arguments to the console, in the fashion of `console.log`,
 * but with an indentation so that it is more visible. (Behat-style)
 * This should otherwise behave as closely as `console.log` as possible.
 * Features :
 *   - proper indentation
 *   - display logs *below* the step that generated them
 * This is completed by an AfterStep hook defined in `../hooks`.
 */
export const log = (...args) => {
  logs.push(_indent_console_output(args));
};



//// CORE //////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Sugar to throw an Error more idiomatically, in order to ensure a step fails. We might throw a custom Error here.
 *
 * @param {string} message
 */
export const fail = (message) => {
  throw new Error(message);
};


/**
 * Get the server (see Chimp doc) and fail when not available.
 *
 * @returns The server as provided by Chimp.
 */
export const getServer = () => {
  if (server) return server;
  throw new Error('Server is unavailable. Run chimp with the --ddp option.');
};


/**
 * Get the current browser and fail when not available.
 *
 * @see http://webdriver.io/api.html for what the browser can do
 * @returns The browser as provided by Chimp.
 */
export const getBrowser = () => {
  if ( ! browser) fail('Browser is unavailable, for some reason.');

  if (browser.getUrl() === 'data:,') {
    console.warn("Browser has no URL. See hooks.js that should prevent this.");
    browser.url(getBaseUrl()); // make sure Meteor and consorts are defined
  }

  return browser;
};


/**
 * Scheme and authority of the URL of the website we're testing.
 * @returns {string} Usually 'http://localhost:3000'.
 */
export const getBaseUrl = () => {
  const ddp = server._original;
  const protocol = 'http' + (ddp.ssl ? 's' : '');
  return `${protocol}://${ddp.host}` + (ddp.port ? `:${ddp.port}` : '');
};


/**
 * Get the current browser's current route, which is the URL's path + query + fragment.
 * @returns {string}
 */
export const getRoute = () => {
  return getBrowser().getUrl().substring(getBaseUrl().length);
};


/**
 * Send the current browser to the provided route, which is the URL's path + query + fragment.
 * @param {string} route
 */
export const visit = (route) => {
  getBrowser().url(`${getBaseUrl()}${route}`);
};


/**
 * F5
 */
export const refresh = () => {
  getBrowser().url(getBrowser().getUrl());
};


/**
 * Pause the browser for `seconds`. This will effectively pause the test runner, as it is synchronous.
 * Use wisely, and do your best NOT to use. It's most useful during development, to slow down what's happening.
 *
 * @param {float} seconds
 */
export const pause = (seconds) => {
  getBrowser().pause(seconds * 1000);
};



//// CONTEXT-DEPENDENT UTILS ///////////////////////////////////////////////////////////////////////////////////////////

const _hasContext = () => { return typeof context !== 'undefined'; }; // long version of context?.I  (livescript FTW)

/**
 * Retrieve fresh data about a user. Yells if the user does not exist.
 *
 * @param {string} name - Display name of the user, as used in the gherkin steps. 'I' is converted to the current user.
 * @returns User
 */
export const getUser = (name) => {
  if (name === 'I' && _hasContext() && context.I) { name = context.I; }
  return models.users.findOneByName(name);
};



//// SERVER REPOSITORY SUGAR ///////////////////////////////////////////////////////////////////////////////////////////

export const getIdea = (query) => {
  return models.ideas.findOne(query);
};


export const getIdeas = (query) => {
  return models.ideas.find(query);
};


export const getIdeasDrafts = (query) => {
  return models.ideas.findDrafts(query);
};


export const getIdeaByTitle = (title) => {
  return models.ideas.findOneByTitle(title);
};



//// DOM ELEMENTS //////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Compensate for the absence of element.hasClass('...') in the webdriver Element API.
 *
 * @param element An Element from the webdriver. http://webdriver.io/api.html
 * @param {string} classes - One class (eg: 'editable') or the intersection of multiple classes (eg: 'alert button').
 */
export const hasClass = (element, classes) => {
  const unique = (e, i, self) => { return i === self.indexOf(e); };
  const requiredClasses = classes.split(' ').filter(unique);
  const existingClasses = element.getAttribute('class').split(' ').filter(unique);

  return existingClasses.concat(requiredClasses).filter(unique).length === existingClasses.length;
};


/**
 * Find exactly one DOM element by its id or class. (and maybe more in the future?)
 * @param {string} idOrClass
 */
export const findByIdOrClass = (idOrClass) => {
  const ids = getBrowser().elements(`#${idOrClass}`).value;
  if      (ids.length == 1) { return ids[0]; }
  else if (ids.length >= 2) { fail(`There is more than one DOM element matching '#${idOrClass}'.`); }
  else if (ids.length == 0) {
    const classes = getBrowser().elements(`.${idOrClass}`).value;
    if      (classes.length == 1) { return classes[0]; }
    else if (classes.length >= 2) { fail(`There is more than one DOM element matching '.${idOrClass}'.`); }
    else if (classes.length == 0) { fail(`No DOM element matching '#${idOrClass}' or '.${idOrClass}'.`); }
    else { fail("Negative length. Bring the flamethrower!"); }
  }
  else { fail("Negative length. Bring the flamethrower!"); }
  fail("I am a teapot.");
};


/**
 * Find exactly one DOM element matching the `query`.
 *
 * `browser.element` will return the first(?) element matching the query if there's more than one.
 * Most of the time we want to make sure there's no ambiguity, so we don't want them to be silent.
 *
 * @param {string} query - A CSS-like element query, such as "#myId" or ".feed .feed-item:nth-child(2)".
 * @returns A webdriver Element
 */
export const findOneDomElement = (query) => {
  try {
    getBrowser().waitForExist(query);
  } catch (e) {
    fail(`No element found for query '${query}' : ${e.message}`);
  }
  const elements = getBrowser().elements(query).value;
  if (elements.length == 0) { fail(`No DOM element matching '${query}'.`); }
  if (elements.length >= 2) { fail(`Ambiguous query : there is more than one DOM element matching '${query}'.`); }

  return elements[0];
};


/**
 * Find at least one DOM element matching the `query`. Always returns an array, even for one element.
 *
 * @param {string} query - A CSS-like element query, such as "#myId" or ".feed .feed-item:nth-child(2)".
 * @returns {array} An array of webdriver Elements.
 */
export const findDomElements = (query) => {
  try {
    getBrowser().waitForExist(query);
  } catch (e) {
    fail(`No element found for query '${query}' : ${e.message}`);
  }
  const elements = getBrowser().elements(query).value;
  // Not 100% sure this is always false because of waitForExist. Best leave it, it's cheap.
  if (elements.length === 0) { fail(`No DOM element matching '${query}'.`); }

  return elements;
};


/**
 * Find and click on the element described by the `query`.
 * Exactly one element must exist in the page for the provided `query`.
 *
 * @param {string} query - A CSS-like element query, such as "#myId" or ".feed .feed-item:nth-child(2)".
 */
export const clickOnElement = (query) => {
  try {
    findOneDomElement(query).click();
  }
  catch (e) {
    fail(`Cannot click on the element '${query}' : ${e.message}`);
  }
};


/**
 * @param element
 * @param {string} text
 * @param {boolean} submit - Defaults to false. Hits Enter after the text when true.
 */
export const typeInEditable = (element, text, submit) => {
  if (element.getAttribute('contenteditable') || hasClass(element, 'editable')) {
    element.click();
    element.keys(text);
    if (typeof submit !== 'undefined' && submit) { element.keys("\uE006"); }
  } else {  // here, add support for input fields
    fail(`DOM element found seems not editable.`);
  }
};

/**
 * @param element
 * @param {string} text
 * @param {boolean} submit - Defaults to false. Hits Enter after the text when true.
 */
export const typeInInput = (elementId, text) => {
  try {
    getBrowser().setValue(`input[name="${elementId}"]`, text);
  } catch (e) {
    getBrowser().setValue(`#${elementId}`, text);
  }
};


//// STRING UTILS //////////////////////////////////////////////////////////////////////////////////////////////////////

export const capitalize = str => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);


export const camelCase = str => {
  let string = str.toLowerCase().replace(/[^A-Za-z0-9]/g, ' ').split(' ')
      .reduce((result, word) => result + capitalize(word.toLowerCase()));
  return string.charAt(0).toLowerCase() + string.slice(1)
};


/**
 * Computes the slug just like the rest of sovereign does. We're simply using `convertToSlug` from the server.
 *
 * /!\ see Issue #201
 *
 *     slugCase("Bob's Idea") == 'bobs-idea'
 *     slugCase("L'œuf de Noël") == 'luf-de-nol'
 *
 * @param {string} str
 * @returns {string}
 */
export const slugCase = (str) => {
  return getServer().execute((str) => { return require('/lib/utils').convertToSlug(str); }, str);
};


/**
 * Cast the provided thing into a number, as humans would. Should yell if it can't cast.
 *
 *     castNum(1.6) == 1.6
 *     castNum(10) == 10
 *     castNum('10') == 10
 *     castNum('1.5') == 1.5
 *     castNum('-.5') == -.5
 *     castNum('three thousand') == 3000
 *     castNum('seventy five') == 75
 *
 * @param thing
 * @returns {number}
 */
export const castNum = (thing) => {
  const asFloat = parseFloat(thing);
  if ( ! isNaN(asFloat) && typeof asFloat === 'number') { return asFloat; }
  return require('words-to-numbers').wordsToNumbers(thing);
};

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
const makeid = (size) => {
  let text = '';
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < size; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};


export const randomText = (n) => { return makeid(n); };

export const randomUsername = () => { return makeid(7); };

export const randomPassword = () => { return randomUsername(); };

export const randomEmail = () => { return `${randomUsername()}@example.com`; };

// // ASSERTIONS UTILS //////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Returns whatever needles were not recursively found in haystack, or null.
 * Please help better naming this function and its vars.
 * Note that for arrays, the order matters.
 *
 * @param {*} needles
 * @param {*} haystack
 * @returns {*}
 */
export const getMissing = (needles, haystack) => {
  let missing = null;
  let empty = true;
  let v;

  if (needles instanceof Array) {
    if ( ! (haystack instanceof Array)) { return needles; }
    missing = [];
    for (let i = 0; i < needles.length; i++) {
      v = getMissing(needles[i], haystack[i]);
      if (v !== null) { missing.push(v); }
    }
    if (0 === missing.length) { missing = null; }
  } else if (needles instanceof Object) {
    if ( ! (haystack instanceof Object)) { return needles; }
    missing = {}; empty = true;
    for (let i in needles) {
      if (needles.hasOwnProperty(i)) {
        v = getMissing(needles[i], haystack[i]);
        if (v !== null) { missing[i] = v; empty = false; }
      }
    }
    if (empty) { missing = null; }
  } else {
    if (needles !== haystack) {
      missing = needles;
    }
  }

  return missing;
};


//// PRIVATE ///////////////////////////////////////////////////////////////////////////////////////////////////////////

const _indent_console_output = (args) => INDENT + args.map(e => stringify(e)).join(' ').replace(/\n/g, '\n' + INDENT);

/**
 * Stringify the provided thing in the fashion of `console.log`.
 *
 * @tests
 *     stringify('babylon') == 'babylon'
 *     stringify(undefined) == 'undefined'
 *     stringify({'foo': 'bar'}) == '{\n\t'foo': 'bar'\n}'
 *
 * @param thing
 * @returns {string}
 */
const stringify = (thing) => {
  switch (typeof thing) {
    case 'string':
      return thing; // just like console.log, don't write quotes
    case 'object':
    case 'array':
      try {
        return JSON.stringify(thing, null, '\t');
      } catch (e) {
        if (e instanceof TypeError) {
          return require('util').inspect(thing);
        }
        throw e;
      }
    default:
      return String(thing);
  }
};

