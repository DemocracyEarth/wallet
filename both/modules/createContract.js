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
  var finalTitle = new String();
  var existingDelegation = _verifyDelegation(delegatorId, delegateId);
  if (!existingDelegation) {
    //creates new
    if (!Contracts.findOne({keyword: keywordTitle})) {
      //uses given title
      finalTitle = keywordTitle;
    } else {
      //adds random if coincidence among people with similar names happened
      finalTitle = keywordTitle + Modules.both.shortUUID();
    }
    var newDelegation =
    {
      keyword: finalTitle,
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
    };

    Meteor.call('insertContract', newDelegation, function(error, result) {
      console.log(result._id);
      Router.go(result.url);
    });

  } else {
    //goes to existing one
    Router.go(existingDelegation.url);
  }
}

/***
* verifies if there's already a precedent among delegator and delegate
***/
let _verifyDelegation = (delegatorId, delegateId) => {
  var delegationContract;
  delegationContract = Contracts.findOne({ 'signatures.0._id': delegatorId, 'signatures.1._id': delegateId });
  if (delegationContract != undefined) {
    return delegationContract;
  } else {
    delegationContract = Contracts.findOne({ 'signatures.1._id': delegatorId, 'signatures.0._id': delegateId });
    if (delegationContract != undefined) {
      return delegationContract;
    }
  }
  return false;
}

Modules.both.startDelegation = _newDelegation;
Modules.both.createContract = _newDraft;
