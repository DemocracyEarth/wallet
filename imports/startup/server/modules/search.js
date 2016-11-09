import { Meteor } from 'meteor/meteor';
import { SearchSource } from 'meteor/meteorhacks:search-source';
import { buildRegExp } from '/imports/utils/functions.js';
import { Tags } from '/imports/api/tags/Tags';
import { Contracts } from '/imports/api/contracts/Contracts';

// Search engine
SearchSource.defineSource('tags', (searchText, type) => {
  const options = { sort: { isoScore: -1 }, limit: 20 };
  // FIX What about with type??
  if (searchText) {
    const regExp = buildRegExp(searchText);
    const selector = { text: regExp, url: regExp };
    return Tags.find(selector, options).fetch();
  }
  return Tags.find({}, options).fetch();
});

SearchSource.defineSource('contracts', (searchText, options) => {
  // FIX options is overdefined, missing info??
  var options = {sort: {isoScore: -1}};
  if(searchText) {
    const regExp = buildRegExp(searchText);
    const selector = {
      title: regExp,
      collectiveId: Meteor.settings.public.Collective._id,
      owner: Meteor.user()._id,
      kind: 'VOTE'
    };
    return Contracts.find(selector, options).fetch();
  } else {
    return Contracts.find({
      collectiveId: Meteor.settings.public.Collective._id,
      kind: 'VOTE',
      owner: Meteor.user()._id
    }, options).fetch();
  }
});
