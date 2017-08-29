import {CONSOLE_INDENT as INDENT} from './constants';


//// LOGGING ///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * We queue in here the logs for each step, and display them all in one go once the step has completed.
 * This is much better-looking than the default rendering of console.log
 * @type {Array}
 */
export const logs = [];


/**
 * Log the arguments to the console, in the fashion of console.log,
 * but with an indentation so that it is more visible. (Behat-style)
 * This should otherwise behave as closely as console.log as can be.
 * Features :
 *   - proper indentation
 *   - display logs *below* the step that generated them
 * This is completed by an AfterStep hook defined in `../hooks`.
 */
export const log = (...args) => {
  logs.push(indent_console_output(args));
};


//// CORE //////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Sugar to throw an Error more idiomatically, in order to ensure a step fails.
 * @param message
 */
export const fail = (message) => {
  throw new Error(message);
};


/**
 * Get the server (see Chimp doc) and fail when not available.
 * @returns object
 */
export const getServer = () => {
  if (server) return server;
  throw new Error('Server is unavailable. Run chimp with the --ddp option.');
};


/**
 * Get the current browser and fail when not available.
 * @see http://webdriver.io/api.html for what the browser can do
 */
export const getBrowser = () => {
  if ( ! browser) throw new Error('Browser is unavailable, for some reason.');

  if (browser.getUrl() == 'data:,') {
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
 * @returns string
 */
export const getRoute = () => {
  return getBrowser().getUrl().substring(getBaseUrl().length);
};


/**
 * Send the current browser to the provided route, which is the URL's path + query + fragment.
 * @param route
 */
export const visit = (route) => {
  browser.url(`${getBaseUrl()}${route}`);
};


/**
 * Find exactly one DOM element matching the `query`.
 * Rationale:
 *   `browser.element` will return the first(?) element matching the query if there's more than one.
 *   Most of the time we want to make sure there's no ambiguity.
 *
 * @param query A CSS-like element query
 */
export const findOneDomElement = (query) => {
  try {
    getBrowser().waitForExist(query);
  } catch (e) {
    fail(`No element found for query '${query}' : ${e}`);
  }
  const elements = getBrowser().elements(`${query}`).value;
  if (elements.length == 0) { fail(`No DOM element matching '${query}'.`); }
  if (elements.length >= 2) { fail(`Ambiguous query : there is more than one DOM element matching '${query}'.`); }

  return elements[0];
};


//// STRING UTILS //////////////////////////////////////////////////////////////////////////////////////////////////////

export const capitalize = str => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);


export const camelCase = str => {
  let string = str.toLowerCase().replace(/[^A-Za-z0-9]/g, ' ').split(' ')
      .reduce((result, word) => result + capitalize(word.toLowerCase()));
  return string.charAt(0).toLowerCase() + string.slice(1)
};


//// PRIVATE ///////////////////////////////////////////////////////////////////////////////////////////////////////////

const indent_console_output = (args) => INDENT + args.map(e => stringify(e)).join(' ').replace(/\n/g, '\n' + INDENT);

/**
 * Stringify the provided thing in the fashion of console.log
 *
 * @tests
 *     stringify('babylon') == 'babylon'
 *     stringify(undefined) == 'undefined'
 *     stringify({'foo': 'bar'}) == '{\n\t'foo': 'bar'\n}'
 *
 * @param thing
 * @returns string
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


//// FEATURE CONTEXT ///////////////////////////////////////////////////////////////////////////////////////////////////

export default function () {

  console.log("Setting up the tools…");

  // Q: Why are some utils methods defined here and not in the global scope ?
  // A: We want access to the current feature context (this). Feel free to refactor.

  /**
   * @param name The full user name used in the gherkin steps. Will be slugged.
   * @returns User
   */
  this.getUser = (name) => {
    if (name == 'I' && this.I) { name = this.I; }
    return fixtures.users.findOneByName(name);
  };

};