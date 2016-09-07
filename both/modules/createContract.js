/***
* generate a new empty draft
* @param {string} keywordTitle - name of the contract to be specifically used for this delegation
****/
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

/***
* generate delegation contract between two identities.
* @param {string} delegatorId - identity assigning the tokens (usually currentUser)
* @param {string} delegateId - identity that will get a request to approve this contract (profile clicked)
* @param {string} keywordTitle - name of the contract to be specifically used for this delegation
***/
let _newDelegation = (delegatorId, delegateId, keywordTitle) => {
  console.log('new delegation');
  var existingDelegation = _verifyDelegation(delegatorId, delegateId);

  console.log('delegatorId: ' + delegatorId);
  console.log('delegateId: ' + delegateId);
  console.log('existingDelegation: ' + existingDelegation);


  console.log('TITLE:')
  console.log(keywordTitle)

  if (!existingDelegation) {
    //creates new
    if (!Contracts.findOne({keyword: keywordTitle})) {
      //uses given title
      var newDelegation = Contracts.insert({
        keyword: keywordTitle,
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
      console.log('NEW CONTRACT CREATED:')
      console.log(newDelegation);
    } else {
      console.log(existingDelegation);
    }
  } else {
    //goes to existing one

  }

/*

*/

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
