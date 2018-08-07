import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { TAPi18n } from 'meteor/tap:i18n';

import { displayPopup } from '/imports/ui/modules/popup';
import { toggle } from '/imports/ui/templates/components/decision/editor/editor.js';
import { geo } from '/lib/geo';
import { token } from '/lib/token';

import '/imports/ui/templates/components/decision/electorate/electorate.html';

/**
* @summary checks on local cache if contract constituency is there
* @param {object} contract contract to evaluate
* @return {boolean} if contract is same as in cache
*/
const _cacheNeedsUpdate = (contract) => {
  const cache = Session.get('voterConstituencyCheckList');

  if (!cache) { return true; }

  console.log('_cacheNeedsUpdate:');
  console.log(cache);
  console.log(contract.constituency);
  if (cache) {
    for (const i in cache) {
      if (cache[i]._id === contract._id) {
        console.log(_.difference(cache[i].constituency, contract.constituency));
        if (_.difference(cache[i].constituency, contract.constituency).length === 0) {
          console.log('NO DIFF');
          return false;
        }
        console.log('!!');
        return true;
      }
    }
  }
  return true;
};


/**
* @summary returns whether user meets or not constituency criteria
* @param {object} contract contract to evaluate
* @return {boolean} if user can vote or not
*/
const _check = (contract) => {
  console.log(`verifying contract id: ${contract._id}`);
  console.log(contract.constituency);

  if (!contract.constituency) { return true; }
  const cache = Session.get('voterConstituencyCheckList');

  if (_cacheNeedsUpdate(contract)) {
    return Meteor.call(
      'verifyConstituency',
      contract,
      function (error, result) {
        if (!error) {
          const match = {
            _id: contract._id,
            constituency: contract.constituency,
            match: result,
          };
          if (!cache || cache.length === 0) {
            Session.set('voterConstituencyCheckList', [match]);
          } else {
            let found = false;
            for (const i in cache) {
              if (cache[i]._id === contract._id) {
                cache[i] = match;
                found = true;
                break;
              }
            }
            if (!found) {
              cache.push(match);
            }
          }
          return result;
        }
        return result;
      }
    );
  }
  for (const i in cache) {
    if (cache[i]._id === contract._id) {
      return cache[i].match;
    }
  }
  return true;
};

/**
* @summary write in textual form the requirements to vote
* @param {object} contract contract with constituency rules
*/
const _writeRule = (contract) => {
  let sentence = TAPi18n.__('electorate-sentence-anyone');
  let setting;
  if (contract.constituency) {
    switch (contract.constituency.length) {
      case 1:
        sentence = TAPi18n.__('electorate-sentence-only');
        break;
      case 2:
        sentence = TAPi18n.__('electorate-sentence-and');
        break;
      case 3:
        sentence = TAPi18n.__('electorate-sentence-all');
        break;
      default:
        sentence = TAPi18n.__('electorate-sentence-anyone');
    }

    let coin;

    for (const i in contract.constituency) {
      switch (contract.constituency[i].kind) {
        case 'TOKEN':
          coin = _.where(token.coin, { code: contract.constituency[i].code })[0];
          if (contract.constituency.length > 1) {
            setting = `<div class="suggest-item suggest-token suggest-token-inline" style="background-color: ${coin.color} ">${coin.code}</div>`;
            break;
          }
          setting = _.where(token.coin, { code: contract.constituency[i].code })[0].name;
          break;
        case 'NATION':
          if (contract.constituency.length > 1) {
            setting = _.where(geo.country, { code: contract.constituency[i].code })[0].emoji;
            break;
          }
          setting = _.where(geo.country, { code: contract.constituency[i].code })[0].name;
          break;
        case 'DOMAIN':
        default:
          setting = contract.constituency[i].code;
          break;
      }
      sentence = sentence.replace(`{{setting${i}}}`, setting);
    }
  }
  return sentence;
};

Template.electorate.helpers({
  status() {
    if (!this.readOnly) {
      return _writeRule(Session.get('draftContract'));
    }
    return _writeRule(this.contract);
  },
  check() {
    if (!this.readOnly) {
      return _check(Session.get('draftContract'));
    }
    return _check(this.contract);
  },
  icon() {
    if (!this.readOnly) {
      const draft = Session.get('draftContract');
      if (draft.constituencyEnabled || draft.constituency.length > 0) {
        return 'active';
      }
    }
    if (!_check(this.contract)) {
      return 'enabled';
    }
    return 'enabled';
  },
  readOnly() {
    if (this.readOnly) {
      return 'editor-button-readonly';
    }
    return '';
  },
});

Template.electorate.events({
  'click #electorate-button'() {
    if (!this.readOnly) {
      toggle('constituencyEnabled', !Session.get('draftContract').constituencyEnabled);
      displayPopup($('#electorate-button')[0], 'constituency', Meteor.userId(), 'click', 'constituency-popup');
    }
  },
});
