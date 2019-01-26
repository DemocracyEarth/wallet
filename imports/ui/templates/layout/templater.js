import { $ } from 'meteor/jquery';
import { Router } from 'meteor/iron:router';

/**
* @summary any custom content that goes to the header when logged out
* @param {string} templateName to use
*/
const _getHeader = (templateName) => {
  switch (templateName) {
    case 'sovereign':
      return `<div class="hero-demo"><img src="${Router.path('home')}images/vote.gif"></div>`;
    default:
      return '';
  }
};

/**
* @summary gets the list of files to include in the html head
* @param {string} templateName to use
*/
const _getStyles = (templateName) => {
  switch (templateName) {
    case 'earth':
      return ['styles/normalize.css', 'styles/webflow.css', 'templates/earth/earth.css', 'templates/earth/extra.css'];
    case 'partidored':
      return ['styles/normalize.css', 'styles/webflow.css', 'templates/partidored/partidored.css', 'templates/partidored/extra.css'];
    case 'decentraland':
      return ['styles/normalize.css', 'styles/webflow.css', 'templates/decentraland/decentraland.css', 'templates/decentraland/extra.css'];
    case 'sovereign':
    default:
      return ['styles/normalize.css', 'styles/webflow.css', 'templates/sovereign/sovereign.css', 'templates/sovereign/extra.css'];
  }
};

/**
* @summary sets the css template to use on this instance of sovereign
* @param {string} templateName to use
*/
const _setCSS = (templateName) => {
  const styles = _getStyles(templateName);

  for (let i = 0; i < styles.length; i += 1) {
    $('head').append($('<link>', {
      rel: 'stylesheet',
      type: 'text/css',
      href: styles[i],
    }));
  }
};

export const setCSS = _setCSS;
export const getHeader = _getHeader;
