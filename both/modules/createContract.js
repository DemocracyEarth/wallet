let newDraft = () => {

  if (!Contracts.findOne({keyword: 'draft-' + Meteor.userId()})) {
    console.log('user had no draft contract, new one created');
    Contracts.insert({ keyword: 'draft-' + Meteor.userId() });
  }

  var id = Contracts.findOne({keyword: 'draft-' + Meteor.userId()})._id;

  Router.go('/vote/draft?id=' + id);

}

Modules.both.createContract = newDraft;
