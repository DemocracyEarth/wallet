let newDraft = (keywordTitle) => {

console.log(keywordTitle);

  //Empty Contract
  if (keywordTitle == undefined) {
    if (!Contracts.findOne({keyword: 'draft-' + Meteor.userId()})) {
      console.log('creating empty contract');
      Contracts.insert({ keyword: 'draft-' + Meteor.userId() });
    }

    var id = Contracts.findOne({keyword: 'draft-' + Meteor.userId()})._id;

    Router.go('/vote/draft?id=' + id);

  //Has title & keyword
  } else {

    if (!Contracts.findOne({keyword: keywordTitle})) {
      console.log('creating contract with keyword: ' + keywordTitle);
      Contracts.insert({ keyword: keywordTitle });
      console.log(Contracts.findOne({ keyword: keywordTitle }));
      return Contracts.find({ keyword: keywordTitle }).fetch();
    }

  }

}

let newDelegation = (userId, delegateId) => {
  console.log('new delegation');

  

}

Modules.both.startDelegation = newDelegation;
Modules.both.createContract = newDraft;
