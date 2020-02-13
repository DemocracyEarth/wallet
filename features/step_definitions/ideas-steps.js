import {fail, getServer, getUser, getIdeas, getIdea, getIdeasDrafts, castNum} from "./support/utils";


export default function () {

  this.Given(/^(.+) ha(?:s|ve) proposed a(n| votable) idea titled "(.+)"$/, (name, votable, title) => {
    votable = votable === " votable";
    const author = getUser(name);
    const idea = getServer().execute((title, authorId, votable) => {
      repository = require('/imports/api/contracts/Contracts').Contracts;
      const ideaId = repository.insert({
        owner: authorId,
        title: title,
        kind:  'VOTE',
        stage: 'LIVE',
        ballotEnabled: votable,
      });

      const author = Meteor.users.findOne({_id: authorId});
      require('/imports/startup/both/modules/Contract').signContract(ideaId, author, 'AUTHOR');

      return repository.findOne({_id: ideaId});
    }, title, author._id, votable);

    if ( ! idea) { fail(`No idea was created with title "${title}".`); }
  });

  this.Then(/^there should (not)? ?be an idea titled "(.+)"$/, (not, title) => {
    const idea = getIdea({title: title});

    if (   not &&    idea) { fail(`There is an idea titled '${title}'.`); }
    if ( ! not &&  ! idea) { fail(`There is no idea titled '${title}'.`); }
  });

  this.Then(/^there should be (.+) ideas? in the database$/, (cnt) => {
    expect(getIdeas()).to.have.lengthOf(castNum(cnt));
  });

  this.Then(/^there should be (.+) ideas? drafts? in the database$/, (cnt) => {
    expect(getIdeasDrafts()).to.have.lengthOf(castNum(cnt));
  });

};
