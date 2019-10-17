import { Meteor } from 'meteor/meteor';

/**
* @summary provide user name if logged, otherwise anon
* @return {string} user name or anonymous
*/
const _logUser = () => {
  if (Meteor.user()) {
    return `'${Meteor.user().username}'`;
  }
  return '[anonymous]';
};

/**
* @summary log activity on server side
* @param {string} message what to log
*/
const _log = (message) => {
  if (Meteor.isServer) {
    console.log(message); // eslint-disable-line no-console
  }
};

/**
* @summary rules applied to overall app
*/
const _rules = {
  TITLE_MAX_LENGTH: 0, // length of contract titles
  MAX_TAGS_PER_CONTRACT: 6, // max amount of tags per contract
  MIN_TAGS_PER_CONTRACT: 1, // min amount.
  MAX_PROFILE_NAME_LENGTH: 20, // Maximum extension of profile name
  VOTES_INITIAL_QUANTITY: 1000, // initial votes for genesis transaction event
};

/**
* @summary default blocktimes
*/
const _blocktimes = {
  ETHEREUM_DAY: 5800,
  ETHEREUM_WEEK: 40600,
  ETHEREUM_MONTH: 174000,
  ETHEREUM_QUARTER: 522000,
  ETHEREUM_YEAR: 2117000,
  ETHEREUM_SECONDS_PER_BLOCK: 15,
};

/**
* @summary settings applied to transactions and delegations
*/
const _defaultSettings = {
  delegations: {
    condition: {
      transferable: true,
      portable: true,
      tags: [],
    },
    currency: 'VOTES',
    kind: 'DELEGATION',
  },
};

/**
* @summary all new contracts unless defined differently will be based on this
*/
const _defaultConstituency = {
  kind: 'TOKEN',
  code: Meteor.settings.public.app.config.token.defaultCode,
  check: 'EQUAL',
};

/**
* @summary gui settings for mobile and desktop rendering
*/
const _gui = {
  MIN_AGORA_WIDTH: 360, // pixel min width for agora when resizing
  MIN_CONTRACT_WIDTH: 360, // pix min width for contract when resizing
  SIDEBAR_WIDTH_MAX: 260, // max width of sidebar for desktop
  DESKTOP_MIN_WIDTH: 992, // min width of desktop view in pixels (connected to CSS)
  MOBILE_MAX_WIDTH: 768, // max width of mobile screens
  ITEMS_PER_PAGE: 100, // max items on lazy load
  ITEMS_IN_LANDING: (Meteor.settings.public.app.config.interface.mainFeed && Meteor.settings.public.app.config.interface.mainFeed.landingMaxItems) ? Meteor.settings.public.app.config.interface.mainFeed.landingMaxItems : 4, // max items on lazy load for landing navigation
};

/**
* @summary timers for animation and other operations
*/
const _timers = {
  SERVER_INTERVAL: 10, // time in ms to communicate with server for contenteditable stuff.
  ANIMATION_DURATION: 250, // pace of animations
  WARNING_DURATION: 5000, // duration of warning messages
  LIQUID_CALIBRATION: 2500,
};

/**
* @summary just default values
*/
const _defaults = {
  TOKEN: 'SHARES',
  CHAIN: 'ETH',
};

/**
* @summary debugging settings
*/
export const DEBUG_MODE_ON = true;
if (Meteor.isClient) {
  if (!DEBUG_MODE_ON) {
    console = console || {}; // eslint-disable-line no-console, no-global-assign
    console.log = function () {}; // eslint-disable-line no-console
  }
}

export const ORGANIZATION_NAME = Meteor.settings.public.Collective ? Meteor.settings.public.Collective.name : '';
export const ORGANIZATION_ID = Meteor.settings.public.Collective ? Meteor.settings.public.Collective._id : '';
export const $LANGUAGE = 'en';
export const log = _log;
export const defaultConstituency = _defaultConstituency;
export const logUser = _logUser;
export const rules = _rules;
export const defaultSettings = _defaultSettings;
export const defaults = _defaults;
export const gui = _gui;
export const timers = _timers;
export const blocktimes = _blocktimes;
