import {
  log, fail, visit, getBrowser, getServer, camelCase, slugCase, refresh, pause, castNum,
  findByIdOrClass, findOneDomElement, findDomElements, clickOnElement, typeInEditable, getIdeas, getIdeaByTitle
} from './support/utils';


// This is getting too big. Ideas about how to refactor are welcome.




export default function () {

  this.Given(/^I reload the page$/, () => {
    refresh();
    // We want to wait for meteor to finish hydrating the page before leaving this step
    pause(0.5);
  });

  this.Given(/^I (?:am on|go to) the homepage$/, () => {
    visit('/');
  });

  this.Given(/^I go on the detail page of the idea titled "(.+)"$/, (title) => {
    visit('/vote/' + slugCase(title));
  });

  this.When(/^I trigger the floating action button$/, () => {
    widgets.fab.click();
  });

  this.Then(/^I (?:wait|pause) (?:for)? *(\d+\.\d*|\d*\.\d+) ?s(?:econds?)?$/, (seconds) => {
    pause(seconds);
  });

  this.When(/^I (?:fill|set) the (.+) (?:with|to) "(.+)"$/, (elementQuery, content) => {
    let element = findByIdOrClass(camelCase(elementQuery));
    if ( ! element) { fail(`Could not find any editable DOM element for query '${elementQuery}'.`); }
    typeInEditable(element, content);
  });

  this.When(/^I comment on the idea with "(.+)"$/, (content) => {
    let element = findOneDomElement('#postComment');
    if ( ! element) { fail(`Could not find any editable DOM element for query '${elementQuery}'.`); }
    typeInEditable(element, content, true);
  });

  this.When(/^I reply to the comment "(.+)" with "(.+)"$/, (parentContent, content) => {
    const contracts = getServer().execute((title) => {
      return require('/imports/api/contracts/Contracts').Contracts.find({'events.content': title}).fetch();
    }, parentContent);
    if (1 > contracts.length) { fail(`No thread found with content "${parentContent}".`); }
    if (1 < contracts.length) { fail(`Too many threads found with content "${parentContent}".`); }

    const threads = contracts[0].events.filter((thread)=>{
      return thread.action == 'COMMENT' && thread.content == parentContent;
    });
    if (1 > threads.length) { fail(`No thread found with content "${parentContent}".`); }
    if (1 < threads.length) { fail(`Too many threads found with content "${parentContent}".`); }

    const thread = threads[0];
    const parentThreadId = thread.id;

    const replyLink = findOneDomElement(`#replyToThread[value="${parentThreadId}"]`);
    replyLink.click();
    typeInEditable(findOneDomElement(`#postComment[name="${parentThreadId}"]`), content, true);
  });


  const _keepCommentsOnly = (o) => {
    if ( ! o.action.includes("COMMENT")) { return false; }
    if (o.children) { o.children = o.children.filter(_keepCommentsOnly); }
    return true;
  };

  this.When(/^I dump the comment tree of the idea titled "(.+)"$/, (ideaTitle) => {
    const idea = getIdeaByTitle(ideaTitle);
    const comments = idea.events.filter(_keepCommentsOnly);

    log(require('yamljs').stringify(comments, 8));
  });

  this.Then(/^the comment tree of the idea titled "(.+)" should look like :$/, (ideaTitle, expected) => {
    const idea = getIdeaByTitle(ideaTitle);
    const comments = idea.events.filter(_keepCommentsOnly);

    const YAML = require('yamljs');

    expected = YAML.parse(expected);

    const getMissing = (needles, haystack) => {
      let missing = null;
      let empty = true;
      let v;

      if (needles instanceof Array) {
        if ( ! (haystack instanceof Array)) { return needles; }
        missing = [];
        for (let i = 0; i < needles.length; i++) {
          v = getMissing(needles[i], haystack[i]);
          if (v !== null) { missing.push(v); }
        }
        if (0 == missing.length) { missing = null; }
      } else if (needles instanceof Object) {
        if ( ! (haystack instanceof Object)) { return needles; }
        missing = {}; empty = true;
        for (let i in needles) {
          if (needles.hasOwnProperty(i)) {
            v = getMissing(needles[i], haystack[i]);
            if (v !== null) { missing[i] = v; empty = false; }
          }
        }
        if (empty) { missing = null; }
      } else {
        if (needles !== haystack) {
          missing = needles;
        }
      }

      return missing;
    };

    const missing = getMissing(expected, comments);

    if (missing) {
      fail(`Could not find :\n${YAML.stringify(missing,8)}\nin\n${YAML.stringify(comments,8)}`);
    }
  });

  this.When(/^I add the tag (.+)$/, (tagTitle) => {
    clickOnElement(`#add-suggested-tag-${slugCase(tagTitle)}`);
  });

  this.When(/^I remove my signature$/, () => {
    clickOnElement('#removeSignature');
    widgets.modal.confirm();
  });

  this.When(/^I sign the idea$/, () => {
    clickOnElement('#author-sign');
    widgets.modal.confirm();
  });

  this.When(/^I enable ballot voting$/, () => {
    clickOnElement('.toggle.ballotEnabled');  // an id pls
  });

  this.When(/^I submit the idea$/, () => {
    clickOnElement('a.button.execute.action-button');  // fix this with an id pls
    widgets.modal.confirm();
  });

  this.When(/^I confirm my choice$/, () => {
    widgets.modal.confirm();
  });

  this.Then(/^I should see "(.+)" (?:(.+) times )?in the page$/, (text, expectedCount) => {
    if (typeof expectedCount === 'undefined') { expectedCount = 1; } else { expectedCount = castNum(expectedCount); }
    const pageText = getBrowser().getText('body');
    const actualCount = (pageText.match(new RegExp(require('escape-string-regexp')(text), "g")) || []).length;
    if (actualCount != expectedCount) {
      log("PAGE CONTENTS","-------------",pageText);  // multi-line Error|fail messages are wrongly colored, so we log
      fail(`Failed to find the text "${text}" in the source.`);
    }
  });

  this.Then(/^I should see "(.+)" in the feed$/, (text) => {
    const feed = widgets.feed.getItems(text);

    if (0 == feed.length) { fail(`Could not find the text "${text}" in the feed.`); }
  });

  this.Then(/^I (?:click on|select) "(.+)" in the feed$/, (text) => {
    let found = widgets.feed.getItems(text);

    if (1 > found.length) { fail(`Could not find the text "${text}" in the feed.`); }
    if (1 < found.length) { fail(`Ambiguous click : too many items in the feed match the title "${text}".`); }

    found[0].click();
  });

  this.Then(/^I (?:wrongly )?(?:click on|select) the (Yes|No) ballot option$/, (yesno) => {
    const query = "#ballotOption #tickbox";  // T_T ; (it actually works and returns 2 elements)
    const ballots = findDomElements(query);

    if (0 == ballots.length) { fail(`Could not find a ballot option to click on.`); }
    if (3 <= ballots.length) { fail(`Ambiguous ballot click : too many (${ballots.length}) tickboxes found.`); }

    if      (yesno == 'Yes') { ballots[0].click(); }
    else if (yesno == 'No')  { ballots[1].click(); }
  });

  this.Then(/^I commit all my votes to the idea$/, () => {
    widgets.voteBar.moveToRight();
    widgets.modal.confirm();
  });

  this.Then(/^I commit (\d+) votes to the idea$/, (votesCommitted) => {
    widgets.voteBar.moveTo(castNum(votesCommitted));
    widgets.modal.confirm();
    // We can't use this step twice in the same page load, it will bug because it's a hack. Feel free to fix it!
    log("Reloading the whole page as well…");
    refresh(); // reloading the whole page makes using this step twice in a row OK
  });



};
