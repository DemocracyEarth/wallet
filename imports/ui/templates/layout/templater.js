import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { $ } from 'meteor/jquery';

/**
* @summary promise that gets the template configured on settings.json
*/
const promise = new Promise((resolve) => {
  HTTP.get(Meteor.absoluteUrl(Meteor.settings.public.web.template.settings), function (err, result) {
    if (!err) {
      resolve(result.data);
    }
  });
});

/**
* @summary any custom content that goes to the header when logged out
* @param {string} templateName to use
*/
const _getImageTemplate = async () => {
  const template = await promise;
  return template.images;
};

/**
* @summary gets image but for react calls
* @param {string} pic to use
*/
const _getTemplateImage = async (pic) => {
  const template = await promise;
  return template.images[pic];
};

/**
* @summary gets the right image given by template
* @param {object} imageTemplate that is getting the images from
* @param {string} pic image you are looking for
*/
const _getImage = (imageTemplate, pic) => {
  return (imageTemplate && imageTemplate[pic]) ? imageTemplate[pic] : Meteor.absoluteUrl(`/images/${pic}.png`);
};

const _getSpinner = async () => {
  const spinner = await promise.then((resolved) => { return resolved.spinner; });
  return spinner;
};

/**
* @summary any custom content that goes to the header when logged out
* @param {string} templateName to use
*/
const _getTemplate = async () => {
  const result = await promise;
  return result;
};

/**
* @summary gets the list of files to include in the html head
*/
const _getStyles = async () => {
  const result = await promise;
  const styles = result.stylesheet.list;

  for (let i = 0; i < styles.length; i += 1) {
    $('head').append($('<link>', {
      rel: 'stylesheet',
      type: 'text/css',
      href: styles[i],
    }));
  }
};

/**
* @summary gets data from template
* @param {object} instance where to save the data
*/
const _templetize = async (instance) => {
  const html = await _getImageTemplate().then((resolved) => { instance.imageTemplate.set(resolved); });
  return html;
};

export const getCSS = _getStyles;
export const getTemplate = _getTemplate;
export const getImageTemplate = _getImageTemplate;
export const getImage = _getImage;
export const getTemplateImage = _getTemplateImage;
export const getSpinner = _getSpinner;
export const templetize = _templetize;
