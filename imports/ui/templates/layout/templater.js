import { $ } from 'meteor/jquery';

/**
* @summary gets the list of files to include in the html head
* @param {string} templateName to use
*/
const _getStyles = (templateName) => {
  switch (templateName) {
    case 'earth':
    case 'partidored':
    case 'decentraland':
    case 'sovereign':
    default:
      return ['templates/sovereign/sovereign.css', 'templates/sovereign/extra.css'];
  }
};

/**
* @summary sets the css template to use on this instance of sovereign
* @param {string} templateName to use
*/
const _setTemplate = (templateName) => {
  const styles = _getStyles(templateName);

  for (let i = 0; i < styles.length; i += 1) {
    $('head').append($('<link>', {
      rel: 'stylesheet',
      type: 'text/css',
      href: styles[i],
    }));
  }
};

export const setTemplate = _setTemplate;
