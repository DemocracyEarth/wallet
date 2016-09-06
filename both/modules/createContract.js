let _newDraft = (keywordTitle) => {
  //Empty Contract
  if (keywordTitle == undefined) {
    if (!Contracts.findOne({keyword: 'draft-' + Meteor.userId()})) {
      Contracts.insert({ keyword: 'draft-' + Meteor.userId() });
    }
    var id = Contracts.findOne({keyword: 'draft-' + Meteor.userId()})._id;
    Router.go('/vote/draft?id=' + id);
  //Has title & keyword
  } else {
    if (!Contracts.findOne({keyword: keywordTitle})) {
      Contracts.insert({ keyword: keywordTitle });
      return Contracts.find({ keyword: keywordTitle }).fetch();
    }
  }
}

let _newDelegation = (delegatorId, delegateId) => {
  console.log('new delegation');
  var keyword = TAPi18n.__('delegation') + '-' + delegatorId + '-' + delegateId;
  var existingDelegation = _verifyDelegation(delegatorId, delegateId);

  console.log(existingDelegation);

  if (!existingDelegation) {
    console.log('new delegation');
    var newDelegation = Contracts.insert({
      keyword: keyword,
      title: TAPi18n.__('delegation-voting-rights'),
      kind: 'DELEGATION',
      signatures: [
        {
          _id: delegatorId,
          role: 'DELEGATOR',
          status: 'PENDING'
        },
        {
          _id: delegateId,
          role: 'DELEGATE',
          status: 'PENDING'
        }
      ]
    });
    console.log(newDelegation);
  } else {
    console.log(existingDelegation);
  }


}

let _verifyDelegation = (delegatorId, delegateId) => {
  var delegationContract;
  delegationContract = Contracts.find({ 'signatures.0._id': delegatorId, 'signatures.1._id': delegateId }).fetch();
  if (delegationContract.length > 0) {
    return delegationContract._id;
  } else {
    delegationContract = Contracts.find({ 'signatures.1._id': delegatorId, 'signatures.0._id': delegateId }).fetch();
    if (delegationContract.length > 0) {
      return delegationContract._id;
    }
  }
  return false;
}


Modules.both.startDelegation = _newDelegation;
Modules.both.createContract = _newDraft;
