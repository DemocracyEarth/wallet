import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Router } from 'meteor/iron:router';
import { ReactiveVar } from 'meteor/reactive-var';

import { getProfileFromUsername, getAnonymous } from '/imports/startup/both/modules/User';
import { removeContract } from '/imports/startup/both/modules/Contract';
import { getProfileName, stripHTMLfromText } from '/imports/ui/modules/utils';
import { timeCompressed } from '/imports/ui/modules/chronos';
import { displayModal } from '/imports/ui/modules/modal';
import { animationSettings } from '/imports/ui/modules/animation';
import { addChoiceToBallot, getTotalVoters, getRightToVote, getBallot } from '/imports/ui/modules/ballot';
import { displayNotice } from '/imports/ui/modules/notice';
import { Contracts } from '/imports/api/contracts/Contracts';
import { templetize, getImage } from '/imports/ui/templates/layout/templater';
import { tokenWeb } from '/lib/token';
import { wrapURLs } from '/lib/utils';

import '/imports/ui/templates/widgets/feed/feedItem.html';
import '/imports/ui/templates/widgets/transaction/transaction.js';
import '/imports/ui/templates/widgets/spinner/spinner.js';
import '/imports/ui/templates/components/identity/avatar/avatar.js';
import '/imports/ui/templates/components/decision/countdown/countdown.js';

import BigNumber from 'bignumber.js';
import { gui } from '/lib/const';

const parser = require('xml-js');

/**
* @summary from an XML get the info structured to represent token data
* @param {string} text of xml source
* @param {string} attribute to look into xml
*/
const _getXMLAttributes = (text, attribute) => {
  const json = parser.xml2js(text, { compact: true, spaces: 4 });
  return json.root[attribute]._attributes;
};


/**
* @summary quick function to determine if a string is a JSON
* @param {string} str ing
*/
const isJSON = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

/**
* @summary gets the description from a moloch proposal
* @param {string} title with xml
* @return {string} with html
*/
const _getProposalDescription = (title, onlyTitle) => {
  const xmlDescription = _getXMLAttributes(title, 'description');
  if (isJSON(xmlDescription.json)) {
    const json = JSON.parse(xmlDescription.json);
    if (json && json.description !== undefined) {
      const description = wrapURLs(json.description, true);
      const html = `<div class='title-header'>${json.title}</div><div class='title-description'>${description}</div>`;
      if (onlyTitle) { return json.title; }
      return html;
    }
  }
  return xmlDescription.json;
};

/**
* @summary determines whether this decision can display results or notice
* @return {boolean} yes or no
*/
const _displayResults = (contract) => {
  if (contract) {
    const dbContract = Contracts.findOne({ _id: contract._id });
    if (dbContract) {
      if (getTotalVoters(contract) > 0 || (dbContract.tally && dbContract.tally.voter.length > 0)) {
        return ((contract.stage === 'FINISH') || (contract.permanentElection && contract.stage !== 'DRAFT'));
      }
    }
  }
  return false;
};

/**
* @summary gets the reply contract
* @param {string} replyId the id of the contract
* @return {object} contract
*/
const _getReplyContract = (replyId) => {
  if (replyId) {
    const dbReply = Contracts.findOne({ _id: replyId });
    if (dbReply) {
      return dbReply;
    }
  }
  return '';
};

/**
* @summary opens post from clicking a feed item
* @param {object} event object
* @param {string} url to open
*/
const _openPost = (event, url) => {
  event.preventDefault();
  event.stopPropagation();
  Router.go(url);
};

/**
* @summary if im on current item context in url determines
* @param {object} item current item
*/
const _here = (item) => {
  return (window.location.pathname.substring(0, item.url.length) === `${item.url}`);
};

/**
* @summary Strips markdown format to render HTML link correctly
* @param {string} text - Expected format is:
*
* "[Click me](<a href='http://www.test.com' target='_blank'>www.test.com</a>)"
*
* @param {string} humanStr - Refers to part within brackets, 'Click me' in the example above
* @returns {string} HTML format that actually contains the human readable part, as in:
*
* "<a href='http://www.test.com' target='_blank'>Click me</a>"
*
*/
const stripMarkdownLink = (text, humanStr) => {
  text = text.slice(text.search('<a href='));
  text = text.slice(0, text.search("target='_blank'>") + 16);
  text = text + humanStr + '</a>';

  return text;
};

/**
* @summary parses a url in a plain text and returns link html
* @param {string} text to be parsed
* @return {string} html with linked url
*/
const parseURL = (text) => {
  const exp = /(\b(((https?|ftp|file|):\/\/)|www[.])[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  const markdownLinkExp = /\[(.*?)\]\((.+?)\)/g;
  const markdownImgExp = /(?:!\[(.*?)\]\((.*?)\))/ig;

  // If markdown image format present, ignore
  if (text.search(markdownImgExp) !== -1) return text;

  let temp = text.replace(exp, "<a href='$1' target='_blank'>$1</a>");
  let result = '';

  while (temp.length > 0) {
    const pos = temp.indexOf("href='");
    if (pos === -1) {
      result += temp;
      break;
    }
    result += temp.substring(0, pos + 6);

    temp = temp.substring(pos + 6, temp.length);
    if ((temp.indexOf('://') > 8) || (temp.indexOf('://') === -1)) {
      result += 'http://';
    }
  }

  // If markdown link format (`[]()`) present, strip for correct rendering
  result = result.replace(markdownLinkExp, stripMarkdownLink(result, '$1'));

  return result;
};


/**
* @summary checks if a string has any substring
* @param {string} str to check
* @param {array} items with substring
* @return {boolean} true or false
*/
const _hasSubstring = (str, items) => {
  let item;
  if (str) {
    for (let i = 0; i < items.length; i += 1) {
      item = str.match(items[i]);
      if (item && item.length > 0) {
        return true;
      }
    }
  }
  return false;
};

/**
* @summary checks a click comes from white space
* @param {string} text to be parsed
* @return {string} html with linked url
*/
const _clickOnWhitespace = (className) => {
  return _hasSubstring(className, ['checkbox', 'title-input', 'title-header', 'title-description', 'smart-contract', 'identity-peer', 'parameter-name', 'parameter-line', 'option-title', 'identity-list']);
};

/**
* @summary replaces string with new content
* @param {string} target to parse
* @param {string} search what to search in string
* @param {string} replacement new string
* @return {string} text to be parsed
*/
const _replaceAll = (target, search, replacement) => {
  return target.split(search).join(replacement);
};

/**
* @summary renders text with html tags
* @param {string} text from db
* @return {string} html poem
*/
const renderMarkup = (text) => {
  // urls
  let html = parseURL(text.replace(/<(?:.|\n)*?>/gm, ''));

  // hashtags
  html = html.replace(/(^|\s)(#[a-z\d][\w-]*)/ig, "$1<a href='/$2'>$2</a>");
  html = _replaceAll(html, "href='/#", "href='/");

  // mentions
  html = html.replace(/(^|\s)(@[a-z\d][\w-]*)/ig, "$1<a href='/@$2'>$2</a>");
  html = _replaceAll(html, "href='/@@", "href='/@");

  // tokens
  // html = html.replace(/(^|\s)(\$[a-z\d][\w-]*)/ig, "$1<a hr`ef='/token/$2'>$2</a>");
  // html = _replaceAll(html, "href='/token/$", "href='$");

  // markup
  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  html = html.replace(/__(.*?)__/g, '<u>$1</u>');
  html = html.replace(/--(.*?)--/g, '<i>$1</i>');
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
  html = html.replace(/##(.*?)##/g, '<small>$1</small>');

  // images
  html = html.replace(/(?:!\[(.*?)\]\((.*?)\))/g, '<img alt="$1" src="$2" />');

  // paragraphs
  html = html.replace(/\n/g, '<br>');

  return html;
};

Template.feedItem.onCreated(function () {
  Template.instance().ready = new ReactiveVar(false);
  Template.instance().contract = new ReactiveVar(Contracts.findOne({ _id: this.data._id }));
  Template.instance().rightToVote = new ReactiveVar(false);
  Template.instance().candidateBallot = new ReactiveVar();
  Template.instance().displayResults = new ReactiveVar(false);
  Template.instance().replySource = new ReactiveVar(false);
  Template.instance().pollingEnabled = new ReactiveVar(false);

  Template.instance().imageTemplate = new ReactiveVar();
  templetize(Template.instance());
});

const _threadItem = (instance) => {
  if (instance.data.mainFeed) {
    $(`#feedItem-${instance.data._id}`).wrapAll(`<div id='thread-${instance.data._id}' class='vote-thread vote-thread-context clickable-item' />`);
    $(`#thread-${instance.data._id}`).prepend(`<div class='thread-sub'><div class='thread-needle thread-reply'>
    <a title='${instance.data.replyId ? `${TAPi18n.__('reply-to')}: ${stripHTMLfromText(_getReplyContract(instance.data.replyId).title).substring(0, 30)}...` : ''}'
    href='${instance.data.replyId ? _getReplyContract(instance.data.replyId).url : ''}'><img src='${Router.path('home')}images/reply.png'></a>
    </div></div>`);
  } else {
    $(`#feedItem-${instance.data._id}`).wrapAll(`<div id='thread-${instance.data._id}' class='vote-thread clickable-item' />`);
    $(`#thread-${instance.data._id}`).prepend(`<div class='thread-sub'><div class='thread-needle ${instance.data.lastItem ? 'thread-last' : ''}'></div></div>`);
    if (instance.data.depth > 1) {
      for (let i = 1; i < instance.data.depth; i += 1) {
        $(`#thread-${instance.data._id}`).wrapAll(`<div id='thread-${instance.data._id}-depth-${i}' class='vote-thread' />`);
      }
    }
  }
  if (instance.data.url && _here(instance.data)) {
    $('.split-left').scrollTop($(`#thread-${instance.data._id}`).offset().top);
  }

  document.getElementById(`feedItem-${instance.data._id}`).addEventListener('click', function (event) {
    _openPost(event, instance.data.url);
  });
};

Template.feedItem.onRendered(function () {
  const instance = this;

  if (Meteor.userId()) {
    instance.voteId = `vote-${Meteor.userId()}-${instance.data._id}`;
  }

  // threading
  if (instance.data.replyId) {
    _threadItem(instance);
  }

  if (instance.data.replyId) {
    const dbReply = Contracts.findOne({ _id: instance.data.replyId });
    if (!dbReply) {
      const source = instance.subscribe('singleContract', { view: 'contract', sort: { timestamp: -1 }, contractId: instance.data.replyId });
      instance.autorun(function (computation) {
        if (source.ready()) {
          Template.instance().replySource.set(true);
          computation.stop();
        }
      });
    } else {
      Template.instance().replySource.set(true);
    }
  }

  if (instance.data.rules && instance.data.rules.pollVoting && instance.data.poll.length > 0) {
    const poll = instance.subscribe('pollContracts', { view: 'pollList', sort: { timestamp: -1 }, poll: instance.data.poll });
    instance.autorun(async function (computation) {
      if (poll.ready()) {
        Template.instance().pollingEnabled.set(true);
        computation.stop();
      }
    });
  }

  if (!instance.data.tally && !instance.data.placeholder) {
    instance.autorun(function () {
      if (instance.data._id) {
        const subscription = instance.subscribe('transaction', { view: 'contractVotes', contractId: instance.data._id });
        const contract = instance.contract.get();
        if (subscription.ready() && !instance.ready.get()) {
          instance.rightToVote.set(getRightToVote(contract));
          instance.candidateBallot.set(getBallot(instance.data._id));
          instance.displayResults.set(_displayResults(contract));
          instance.ready.set(true);
        }
      }
    });
  } else {
    const contract = instance.data;
    instance.rightToVote.set(getRightToVote(instance.data));
    instance.candidateBallot.set(getBallot(instance.data._id));
    instance.displayResults.set(_displayResults(contract));
    instance.ready.set(true);
  }
});

Template.feedItem.helpers({
  /*
  description() {
    let text = String();
    const profile = [];
    if (this.kind === 'DELEGATION') {
      for (const user in this.signatures) {
        profile.push(getProfileFromUsername(this.signatures[user].username));
      }
      text = this.description;
      if (profile.length === 2) {
        text = text.replace('<delegator>', getProfileName(profile[0]));
        text = text.replace('<delegate>', getProfileName(profile[1]));
      }
      return stripHTMLfromText(text).replace(/(([^\s]+\s\s*){35})(.*)/, '$1…');
    }
    return stripHTMLfromText(this.description).replace(/(([^\s]+\s\s*){35})(.*)/, '$1…');
  },*/
  url() {
    if (this.stage === 'DRAFT') {
      return `/vote/draft?id=${this._id}`;
    }
    return this.url;
  },
  tags() {
    return this.tags;
  },
  focused() {
    if (_here(this)) {
      return 'title-thread';
    }
    return '';
  },
  contextHere() {
    return _here(this);
  },
  sinceDate(timestamp) {
    return `${timeCompressed(timestamp)}`;
  },
  blockchainAddress() {
    if (this.blockchain.publicAddress) {
      return `${this.blockchain.publicAddress.substring(0, 6)}...${this.blockchain.publicAddress.slice(-4)}`;
    }
    return TAPi18n.__('off-chain');
  },
  blockchainFullAddress() {
    return `${TAPi18n.__('moloch-delegate-key')} ${this.blockchain.publicAddress}`;
  },
  blockchainLink() {
    return `${Meteor.settings.public.web.sites.blockExplorer}/address/${this.blockchain.publicAddress}`;
  },
  editorMode(stage) {
    if (stage === 'DRAFT') { return true; } return false;
  },
  voterMode(stage) {
    if (stage === 'LIVE') { return true; } return false;
  },
  embeddedMode() {
    return Template.instance().embeddedMode.get();
  },
  signatures() {
    if (this.signatures) {
      return this.signatures;
    }
    return [getAnonymous()];
  },
  tally() {
    return (this.rules && this.rules.pollVoting) ? Template.instance().pollingEnabled.get() : this.tally;
  },
  webVote() {
    return this.blockchain.coin.code === tokenWeb.coin[0].code;
  },
  userIsAuthor(signatures) {
    if (Meteor.user() != null) {
      if (Meteor.user()._id === this.owner) {
        return true;
      }
      for (const stamp in signatures) {
        if (signatures[stamp]._id === Meteor.user()._id) {
          return true;
        }
      }
    }
    return false;
  },
  delegationMode() {
    return (this.kind === 'DELEGATION');
  },
  displayActions() {
    return this.displayActions;
  },
  senderId() {
    return this.signatures[0]._id;
  },
  receiverId() {
    return this.signatures[1]._id;
  },
  feedContract() {
    return Template.instance().contract.get();
  },
  pollingEnabled() {
    return Template.instance().pollingEnabled.get();
  },
  quadraticEnabled() {
    return this.rules ? this.rules.quadraticVoting : false;
  },
  balanceEnabled() {
    return this.rules ? this.rules.balanceVoting : false;
  },
  onChainVote() {
    return this.rules ? (!this.rules.balanceVoting && !this.rules.quadraticVoting) : true;
  },
  pollList() {
    return this.poll;
  },
  pollId() {
    return this._id;
  },
  pollTotals() {
    const choices = Contracts.find({ pollId: this._id }).fetch();
    let total = new BigNumber(0);
    for (let i = 0; i < choices.length; i += 1) {
      if (choices[i].blockchain.score && choices[i].blockchain.score.totalConfirmed) {
        total = total.plus(choices[i].blockchain.score.totalConfirmed);
      }
    }
    return total.toString();
  },
  rules() {
    return this.rules;
  },
  voters() {
    let total;
    let list = [];
    const contract = Contracts.findOne({ _id: this._id });
    let choice;

    if (contract.poll && contract.poll.length > 0) {
      // poll contract
      total = 0;
      for (let i = 0; i < contract.poll.length; i += 1) {
        choice = Contracts.findOne({ _id: contract.poll[i].contractId });

        if (choice) {
          list = list.concat(_.pluck(choice.tally.voter, '_id'));
        }
      }
      total = _.uniq(list).length;
    } else if (contract && contract.tally) {
      // normal
      total = contract.tally.voter.length;
    } else {
      total = getTotalVoters(this);
    }

    if (total === 1) {
      return `${total} ${TAPi18n.__('voter').toLowerCase()}`;
    } else if (total === 0) {
      return TAPi18n.__('no-voters');
    }
    return `${total} ${TAPi18n.__('voters').toLowerCase()}`;
  },
  replyMode() {
    const draft = Session.get('draftContract');
    if (draft.replyId !== '') {
      return 'opacity: 0.5;';
    }
    return '';
  },
  electionData() {
    return Template.instance().ready.get();
  },
  replySource() {
    return Template.instance().replySource.get();
  },
  replyEditor() {
    return (Session.get('draftContract') && Session.get('draftContract').replyId === this._id);
  },
  spinnerStyle() {
    return `height: 0px;
            float: right;
            margin-top: 14px;
            margin-left: 10px;
            width: 20px;`;
  },
  rightToVote() {
    return Template.instance().rightToVote.get();
  },
  candidateBallot() {
    return Template.instance().candidateBallot.get();
  },
  displayResults() {
    const dbContract = Contracts.findOne({ _id: this._id });
    if (dbContract && dbContract.tally && dbContract.tally.voter.length > 0) {
      return true;
    }
    return Template.instance().displayResults.get();
  },
  replyData() {
    return {
      desktopMode: true,
      replyMode: true,
      replyId: this._id,
      depth: this.depth,
      mainFeed: this.mainFeed,
    };
  },
  title() {
    return renderMarkup(this.title);
  },
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
  pollContent() {
    return this.pollId;
  },
  pollStyle() {
    if (this.poll && this.poll.length > 0) {
      return 'vote-poll';
    }
    return '';
  },
  requiresClosing() {
    return (this.rules && ((this.rules.alwaysOn === false) || this.rules.pollVoting));
  },
  closingData() {
    const closing = this.closing;
    if (closing) {
      closing.alwaysOn = this.rules.alwaysOn;
      closing.period = this.period;
      closing.timestamp = this.timestamp;
      closing.collectiveId = this.collectiveId;
    }
    return closing;
  },
  moloch() {
    return gui.MOLOCH_DAPP;
  },
  request() {
    const parameter = _getXMLAttributes(this.title, 'request');
    return {
      token: parameter.token,
      balance: parameter.quantity,
      placed: parameter.quantity,
      available: parameter.quantity,
      disableStake: true,
      disableBar: true,
    };
  },
  tribute() {
    const parameter = _getXMLAttributes(this.title, 'tribute');
    return {
      token: parameter.token,
      balance: parameter.quantity,
      placed: parameter.quantity,
      available: parameter.quantity,
      disableStake: true,
      disableBar: true,
    };
  },
  applicant() {
    return { _id: _getXMLAttributes(this.title, 'user')._id };
  },
  description() {
    return `<div>${_getProposalDescription(this.title, false)}</div>`;
  },
});

Template.feedItem.events({
  'click .micro-button-remove'(event) {
    const proposalTitle = event.target.parentNode.getAttribute('title');
    const proposalId = event.target.parentNode.getAttribute('id');
    const dom = `#feedItem-${proposalId}`;
    displayModal(
      true,
      {
        icon: 'images/remove-item.png',
        title: TAPi18n.__('remove-title'),
        message: `${TAPi18n.__('remove-draft-warning')} <br><em>${proposalTitle}</em>`,
        cancel: TAPi18n.__('not-now'),
        action: TAPi18n.__('remove-draft'),
        displayProfile: false,
      },
      () => {
        $(dom)
          .velocity({ opacity: 0, marginTop: '0px', marginBottom: '0px', height: 0 }, {
            duration: animationSettings.duration,
            complete() {
              removeContract(proposalId);
              displayNotice(TAPi18n.__('remove-draft-success'), true);
            },
          });
      }
    );
  },
  'click .micro-button-addballot'(event) {
    addChoiceToBallot(Session.get('contract')._id, event.target.parentNode.getAttribute('id'));
  },
  'click #blockchain-explorer'(event) {
    event.preventDefault();
    window.open(event.currentTarget.href, '_blank');
  },
  'click .vote'(event, instance) {
    if (_clickOnWhitespace($(event.target).attr('class'))) {
      _openPost(event, instance.data.url);
    }
  },
});

export const threadItem = _threadItem;
export const getProposalDescription = _getProposalDescription;
