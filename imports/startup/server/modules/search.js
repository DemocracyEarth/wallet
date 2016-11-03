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
      kind: KIND_VOTE
    };
    return Contracts.find(selector, options).fetch();
  } else {
    return Contracts.find({
      collectiveId: Meteor.settings.public.Collective._id,
      kind: KIND_VOTE,
      owner: Meteor.user()._id
    }, options).fetch();
  }
});

function buildRegExp(searchText) {
  var words = searchText.trim().split(/[ \-\:]+/);
  var exps = _.map(words, function(word) {
    return "(?=.*" + word + ")";
  });
  var fullExp = exps.join('') + ".+";
  return new RegExp(fullExp, "i");
}
