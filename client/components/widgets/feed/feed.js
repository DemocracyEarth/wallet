Template.feed.helpers({
  item: function () {

    var contractFeed = Contracts.find({ collectiveId: "rqmEvKiMMaideGfjN" }).fetch();

    console.log(contractFeed);

    return [0, 1, 3, 4];
  }
})
