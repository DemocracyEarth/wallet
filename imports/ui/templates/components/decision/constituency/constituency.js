import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { animatePopup } from '/imports/ui/modules/popup';
import { searchJSON } from '/imports/ui/modules/JSON';
import { geo } from '/lib/geo';
import { token } from '/lib/token';

import '/imports/ui/templates/components/decision/constituency/constituency.html';

const _save = () => {
  const draft = Session.get('draftContract');
  const country = Session.get('newCountry');
  const domain = $('.login-input-domain')[0];


  draft.constituency = _.reject(draft.constituency, (rule) => { return (rule.kind === 'NATION' || rule.kind === 'DOMAIN'); });

  if (country && country !== '') {
    draft.constituency.push({
      kind: 'NATION',
      code: country.code,
      check: 'EQUAL',
    });
  }
  if (domain && domain.value !== '') {
    draft.constituency.push({
      kind: 'DOMAIN',
      code: domain.value,
      check: 'EQUAL',
    });
  }

  if (draft.constituency.length === 0) {
    draft.constituencyEnabled = false;
  }

  Session.set('draftContract', draft);
};


/**
* @summary checks a domain name is well written
* @return {boolean} true or false baby
*/
const _verifyDomainName = (domain) => {
  const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
  '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return pattern.test(domain);
};

/**
* @summary check form inputs are ok
* @return {boolean} true or false baby
*/
const _checkInputs = () => {
  return !(Session.get('noMatchFound'));
};

Template.constituency.onCreated(() => {
  Session.set('showNations', false);
  Session.set('suggestDisplay', '');
});

Template.constituency.onRendered(function () {
  const draft = Session.get('draftContract');
  for (const i in draft.constituency) {
    if (draft.constituency[i].kind === 'DOMAIN') {
      $('.login-input-domain')[0].value = draft.constituency[i].code;
    }
  }
  // show current coin set in draft
  for (let i = 0; i < draft.constituency.length; i += 1) {
    if (draft.constituency[i].kind === 'NATION') {
      for (let j = 0; j < geo.country.length; j += 1) {
        if (geo.country[j].code === draft.constituency[i].code) {
          Session.set('newCountry', geo.country[j]);
          break;
        }
      }
      break;
    }
  }
});

Template.constituency.helpers({
  showNations() {
    return (Session.get('suggestDisplay') === 'NATION');
  },
  country() {
    if (Session.get('newCountry') !== undefined) {
      return Session.get('newCountry').name;
    }
    return undefined;
  },
  buttonDisable() {
    if (!_checkInputs()) {
      return 'button-disabled';
    }
    return '';
  },
  wrongAddress() {
    return _verifyDomainName($('.login-input-domain')[0]);
  },
});

Template.constituency.events({
  'click #cancel-constituency'() {
    const draft = Session.get('draftContract');
    if (!draft.constituency || draft.constituency.length === 0) {
      draft.constituencyEnabled = false;
      Session.set('draftContract', draft);
    }
    Session.set('showConstituencyEditor', false);
    animatePopup(false, 'constituency-popup');
  },
  'click #execute-constituency'() {
    if (_checkInputs()) {
      _save();
      Session.set('showConstituencyEditor', false);
      animatePopup(false, 'constituency-popup');
    }
  },
  'input .country-search'(event) {
    if (event.target.value !== '') {
      Session.set('filteredCountries', searchJSON(geo.country, event.target.value));
    } else {
      Session.set('filteredCountries', geo.country);
      Session.set('newCountry', '');
    }
  },
  'focus .country-search'() {
    Session.set('suggestDisplay', 'NATION');
  },
});
