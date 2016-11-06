import { buildRegExp }  from '../../utils/functions.js';

//Search engine
SearchSource.defineSource('tags', function(searchText, options) {
  var options = {sort: {isoScore: -1}, limit: 20};

  if(searchText) {
    var regExp = buildRegExp(searchText);
    var selector = {text: regExp, url: regExp};
    return Tags.find(selector, options).fetch();
  } else {
    return Tags.find({}, options).fetch();
  }
});

SearchSource.defineSource('contracts', function(searchText, options) {
  var options = {sort: {isoScore: -1}};
  if(searchText) {
    var regExp = buildRegExp(searchText);
    var selector = {
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
