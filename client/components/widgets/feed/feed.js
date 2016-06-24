Template.feed.helpers({
  item: function () {
    var contractFeed = Contracts.find({ collectiveId: Session.get('collectiveId') }).fetch();
    return contractFeed;
  }
})
