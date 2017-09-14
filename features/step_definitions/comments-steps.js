import {log, fail, getServer, findOneDomElement, typeInEditable, getIdeaByTitle, getMissing} from "./support/utils";


export default function () {

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
    const YAML = require('yamljs');
    const idea = getIdeaByTitle(ideaTitle);
    const comments = idea.events.filter(_keepCommentsOnly);
    const missing = getMissing(YAML.parse(expected), comments);
    if (missing) {
      fail(`Could not find :\n${YAML.stringify(missing,8)}\nin\n${YAML.stringify(comments,8)}`);
    }
  });

};