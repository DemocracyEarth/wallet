Template.feed.helpers({
  item: function () {
    var contractFeed = Contracts.find({ collectiveId: Session.get('collectiveId')}, {sort: {timestamp: -1}} ).fetch();
    return contractFeed;
  }
})
