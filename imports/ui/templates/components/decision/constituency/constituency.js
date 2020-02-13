import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

import { templetize, getImage } from '/imports/ui/templates/layout/templater';
import { animatePopup } from '/imports/ui/modules/popup';
import { searchJSON } from '/imports/ui/modules/JSON';
import { token } from '/lib/token';

import '/imports/ui/templates/components/decision/constituency/constituency.html';

const _save = () => {
  const draft = Session.get('draftContract');
  const country = Session.get('newCountry');
  const domain = document.getElementById('editDomain');


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
const _checkDomainName = (domain) => {
  if (domain) {
    const pattern = new RegExp(/^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/);
    return pattern.test(domain);
  }
  return true;
};

/**
* @summary check form inputs are ok
* @return {boolean} true or false baby
*/
const _checkInputs = () => {
  return !(Session.get('noMatchFound') || !Session.get('domainSyntaxCheck'));
};

Template.constituency.onCreated(() => {
  Session.set('showNations', false);
  Session.set('suggestDisplay', '');
});

Template.constituency.onRendered(function () {
  const draft = Session.get('draftContract');
  document.getElementById('editDomain').value = '';
  for (const i in draft.constituency) {
    if (draft.constituency[i].kind === 'DOMAIN') {
      document.getElementById('editDomain').value = draft.constituency[i].code;
    }
  }
  Session.set('domainSyntaxCheck', _checkDomainName(document.getElementById('editDomain').value));
  // show current coin set in draft
  document.getElementById('editCountry').value = '';
  const geo = Session.get('geo');
  for (let i = 0; i < draft.constituency.length; i += 1) {
    if (draft.constituency[i].kind === 'NATION') {
      for (let j = 0; j < geo.country.length; j += 1) {
        if (geo.country[j].code === draft.constituency[i].code) {
          Session.set('newCountry', geo.country[j]);
          document.getElementById('editCountry').value = geo.country[j].name;
          break;
        }
      }
      break;
    }
  }
});

Template.constituency.onCreated(function () {
  Template.instance().imageTemplate = new ReactiveVar();
  templetize(Template.instance());
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
    return !Session.get('domainSyntaxCheck');
  },
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
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
    Session.set('domainSyntaxCheck', _checkDomainName(document.getElementById('editDomain').value));
    if (_checkInputs()) {
      _save();
      Session.set('showConstituencyEditor', false);
      animatePopup(false, 'constituency-popup');
    }
  },
  'blur #editDomain'() {
    Session.set('domainSyntaxCheck', _checkDomainName(document.getElementById('editDomain').value));
  },
  'input .country-search'(event) {
    const geo = Session.get('geo');
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
