import { CONSOLE_INDENT as INDENT } from './constants';

const util = require('util');

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



//// PRIVATE ///////////////////////////////////////////////////////////////////////////////////////////////////////////

const indent_console_output = (args) => INDENT + args.map(e => stringify(e)).join(' ').replace(/\n/g, '\n'+INDENT);

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
                if (e instanceof TypeError) return util.inspect(thing);
                throw e;
            }
        default:
            return String(thing);
    }
};