import { Meteor } from 'meteor/meteor';
import { getTemplate } from '/imports/ui/templates/layout/templater';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';

const _getGeoJSON = async () => {
  const template = await getTemplate().then((resolved) => {
    return new Promise((res) => {
      HTTP.get(Meteor.absoluteUrl(resolved.lib.geo), function (err, result) {
        if (!err) {
          res(result.data);
        }
      });
    });
  });
  return template;
};

/**
* @summary promise that gets the template configured on settings.json
*/
const _getCountries = async () => {
  return await _getGeoJSON().then((res) => {
    Session.set('geo', res);
    Session.set('filteredCountries', res.country);
  });
};

const _geo = async () => { return await _getCountries(); };

if (Meteor.isClient) {
  _geo();
}

export const geo = _geo;
