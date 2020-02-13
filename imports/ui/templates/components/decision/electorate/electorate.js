import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';

import { displayPopup, animatePopup } from '/imports/ui/modules/popup';
import { toggle } from '/imports/ui/templates/components/decision/editor/editor.js';
import { token } from '/lib/token';
import { templetize, getImage } from '/imports/ui/templates/layout/templater';

import '/imports/ui/templates/components/decision/electorate/electorate.html';
import '/imports/ui/templates/components/decision/blockchain/blockchain';

/**
* @summary verifies if a given user is a valid member of this contract dao
* @param {object} user info
* @param {object} contract data
* @return {boolean} if user can vote or not
*/
const _isMember = (user, contract) => {
  const collectives = (user && user.profile && user.profile.collectives) ? user.profile.collectives : [];
  for (let i = 0; i < collectives.length; i += 1) {
    if (collectives[i] === contract.collectiveId) {
      return true;
    }
  }
  return false;
};

/**
* @summary verifies if user has a verified email from a given domain
* @param {object} emailList obtained from profile
* @param {string} domain what domain to check for
* @return {boolean} if user has valid mail or not
*/
const _emailDomainCheck = (emailList, domain) => {
  let legit = false;
  if (emailList.length > 0) {
    for (const k in emailList) {
      if (emailList[k].verified) {
        const emailDomain = emailList[k].address.replace(/.*@/, '');
        if (emailDomain === domain) {
          legit = true;
          break;
        }
      }
    }
  }
  return legit;
};

/**
* @summary checks if user has token required to voteEnabled
* @param {object} user profile to check
* @param {string} token ticker
*/
const _checkTokenAvailability = (user, ticker) => {
  if (user.profile.wallet.reserves && user.profile.wallet.reserves.length > 0) {
    for (let i = 0; i < user.profile.wallet.reserves.length; i += 1) {
      if (token.coin) {
        for (let k = 0; k < token.coin.length; k += 1) {
          if (token.coin[k].code === user.profile.wallet.reserves[i].token || (token.coin[k].subcode && token.coin[k].subcode === user.profile.wallet.reserves[i].token)) {
            if (token.coin[k].code === ticker || (token.coin[k].subcode && token.coin[k].subcode === ticker)) {
              return true;
            }
          }
        }
      }
    }
  }
  return false;
};

/**
* @summary returns address to receive crypto
* @param {object} user user wallet
* @param {object} token ticker
* @return {string} address
*/
const _getTokenAddress = (user, ticker) => {
  if (ticker === 'WEB VOTE') {
    return (user.profile.wallet.currency === ticker);
  }

  if (Session.get('token')) { token = Session.get('token'); }

  if (user.profile.wallet.reserves && user.profile.wallet.reserves.length > 0) {
    for (let i = 0; i < user.profile.wallet.reserves.length; i += 1) {
      for (let k = 0; k < token.coin.length; k += 1) {
        if (token.coin[k].code === ticker || (token.coin[k].subcode && token.coin[k].subcode === ticker)) {
          if (token.coin[k].code === user.profile.wallet.reserves[i].token || token.coin[k].subcode === user.profile.wallet.reserves[i].token) {
            return user.profile.wallet.reserves[i].publicAddress;
          }
        }
      }
    }
  }
  return false;
};

/**
* @summary returns contract address of token in trasaction
* @param {object} token ticker
* @return {string} address
*/
const _getTokenContractAddress = (ticker) => {
  const i = token.coin.findIndex(t => t.code === ticker);
  return token.coin[i].contractAddress;
};

/**
* @summary returns whether user meets or not constituency criteria
* @param {object} contract contract to evaluate
* @return {boolean} if user can vote or not
*/
const _verifyConstituencyRights = (contract) => {
  let legitimacy = true;

  if (Meteor.user() && contract && contract.wallet.currency !== 'NONE') {
    if (contract.constituency && contract.constituency.length > 0) {
      for (const i in contract.constituency) {
        switch (contract.constituency[i].kind) {
          case 'TOKEN':
            if (_getTokenAddress(Meteor.user(), contract.constituency[i].code)) {
              legitimacy = true;
            } else {
              legitimacy = false;
            }
            break;
          case 'DOMAIN':
            if (Meteor.user().emails) {
              if (!_emailDomainCheck(Meteor.user().emails, contract.constituency[i].code)) {
                legitimacy = false;
              }
            }
            if (Meteor.user().services && Meteor.user().services.facebook) {
              if (!_emailDomainCheck([{ address: Meteor.user().services.facebook.email, verified: true }], contract.constituency[i].code)) {
                legitimacy = false;
              }
            }
            break;
          case 'NATION':
          default:
            if ((Meteor.user().profile.country && Meteor.user().profile.country.code !== contract.constituency[i].code) || !Meteor.user().profile.country) {
              legitimacy = false;
            }
            break;
        }
        if (legitimacy === false) {
          break;
        }
      }
    } else {
      legitimacy = true;
    }
  } else {
    legitimacy = false;
  }

  return legitimacy;
};

/**
* @summary write in textual form the requirements to vote
* @param {object} contract contract with constituency rules
*/
const _writeRule = (contract, textOnly) => {
  let format = '';
  if (textOnly) {
    format = '-textonly';
  }
  let sentence = TAPi18n.__(`electorate-sentence-anyone${format}`);
  let setting;
  let total = 0;
  if (contract.constituency) {
    for (let j = 0; j < contract.constituency.length; j += 1) {
      if (contract.constituency[j].kind === 'NATION' || contract.constituency[j].kind === 'DOMAIN') {
        total += 1;
      }
    }

    switch (total) {
      case 1:
        sentence = TAPi18n.__(`electorate-sentence-only${format}`);
        break;
      case 2:
        sentence = TAPi18n.__(`electorate-sentence-and${format}`);
        break;
      case 3:
        sentence = TAPi18n.__(`electorate-sentence-all${format}`);
        break;
      default:
        sentence = TAPi18n.__(`electorate-sentence-anyone${format}`);
    }

    const geo = Session.get('geo');

    let counter = 0;
    for (const i in contract.constituency) {
      let found = false;
      switch (contract.constituency[i].kind) {
        case 'NATION':
          found = true;
          if (!textOnly && contract.constituency.length > 0) {
            setting = _.where(geo.country, { code: contract.constituency[i].code })[0].emoji;
            break;
          } else if (textOnly) {
            setting = `${TAPi18n.__('from')} ${_.where(geo.country, { code: contract.constituency[i].code })[0].name}`;
          } else {
            setting = _.where(geo.country, { code: contract.constituency[i].code })[0].name;
          }
          break;
        case 'DOMAIN':
          found = true;
          if (textOnly) {
            setting = TAPi18n.__('valid-email-domain').replace('{{domain}}', contract.constituency[i].code);
          } else {
            setting = contract.constituency[i].code;
          }
          break;
        default:
          break;
      }
      if (found) {
        sentence = sentence.replace(`{{setting${counter}}}`, setting);
        counter += 1;
      }
    }
  }
  return sentence;
};

Template.electorate.onCreated(() => {
  let contract;
  if (!Template.currentData().readOnly) {
    contract = Session.get('draftContract');
  } else {
    contract = Template.currentData().contract;
  }
  Session.set('showConstituencyEditor', false);
  // Template.instance().voteEnabled = _verifyConstituencyRights(contract);

  Template.instance().imageTemplate = new ReactiveVar();
  templetize(Template.instance());
});

const killPopup = () => {
  toggle('constituencyEnabled', !Session.get('draftContract').constituencyEnabled);
  if (Session.set('showConstituencyEditor')) {
    Session.set('showConstituencyEditor', false);
  } else {
    Session.set('showConstituencyEditor', true);
  }
  displayPopup($('#electorate-button')[0], 'constituency', Meteor.userId(), 'click', 'constituency-popup');
};

Template.electorate.onRendered(function () {
  const instance = this;
  window.addEventListener('click', function (e) {
    if (document.getElementById('card-constituency-popup') && !document.getElementById('card-constituency-popup').contains(e.target)) {
      if (!instance.data.readOnly) {
        toggle('constituencyEnabled', false);
        Session.set('showConstituencyEditor', false);
        animatePopup(false, 'constituency-popup');
      }
    }
  });

  instance.autorun(function () {
    $('.right').scroll(() => {
      if (Session.get('showConstituencyEditor')) {
        Session.set('showConstituencyEditor', false);
        animatePopup(false, 'constituency-popup');
      }
    });
  });
});

Template.electorate.helpers({
  getImage() {
    if (_isMember(Meteor.user(), this.contract)) {
      return getImage(Template.instance().imageTemplate.get(), 'electorate-check-enabled');
    }
    return getImage(Template.instance().imageTemplate.get(), 'electorate-check-reject-enabled');
    /**
    if (!this.readOnly) {
      if (Session.get('showConstituencyEditor')) {
        return getImage(Template.instance().imageTemplate.get(), 'electorate-check-active');
      }
      return getImage(Template.instance().imageTemplate.get(), 'electorate-check-editor');
    }
    if (!Template.instance().voteEnabled) {
      return getImage(Template.instance().imageTemplate.get(), 'electorate-check-reject-enabled');
    }
    return getImage(Template.instance().imageTemplate.get(), 'electorate-check-enabled');
     */
  },
  status() {
    /* let rule;
    if (!this.readOnly) {
      rule = _writeRule(Session.get('draftContract'));
      if (rule === TAPi18n.__('electorate-sentence-anyone') || rule === 'undefined') {
        return TAPi18n.__('requisites');
      }
      return `${TAPi18n.__('requisites')} &#183; ${rule}`;
    }
    rule = _writeRule(this.contract);
    if (rule === TAPi18n.__('electorate-sentence-anyone') || rule === 'undefined') {
      return '';
    } */
    let rule;
    let style;
    if (_isMember(Meteor.user(), this.contract)) {
      rule = TAPi18n.__('moloch-valid-voter');
      style = 'election-rule-can-vote';
    } else {
      rule = TAPi18n.__('moloch-invalid-voter');
      style = 'election-rule-not-member';
    }
    return `<div class="electorate-rule ${style}">${rule}</div>`;
  },
  editorId() {
    if (!this.readOnly) {
      return 'electorate-button';
    }
    return '';
  },
  description() {
    if (_isMember(Meteor.user(), this.contract)) {
      return TAPi18n.__('moloch-member-can-vote');
    }
    return TAPi18n.__('moloch-member-cannot-vote');
    /**
    if (this.readOnly) {
      return _writeRule(this.contract, true);
    }
    return '';
    */
  },
  /** icon() {
    if (!this.readOnly) {
      if (Session.get('showConstituencyEditor')) {
        return 'active';
      }
      return 'editor';
    }
    if (!Template.instance().voteEnabled) {
      return 'reject-enabled';
    }
    return 'enabled';
  },*/
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
      killPopup();
    }
  },
});

export const verifyConstituencyRights = _verifyConstituencyRights;
export const getTokenAddress = _getTokenAddress;
export const getTokenContractAddress = _getTokenContractAddress;
export const checkTokenAvailability = _checkTokenAvailability;
export const isMember = _isMember;
