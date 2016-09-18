import {default as Modules} from "./modules";

/***
* generate a new empty draft
* @param {string} keywordTitle - name of the contract to be specifically used for this delegation
* @return {object} contract - if it's empty then call router with new contract, otherwise returns contract object from db
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
      kind: KIND_DELEGATION,
      signatures: [
        {
          _id: delegatorId,
          role: ROLE_DELEGATOR,
          status: STATUS_PENDING
        },
        {
          _id: delegateId,
          role: ROLE_DELEGATE,
          status: STATUS_PENDING
        }
      ]
    };

    Meteor.call('insertContract', newDelegation, function(error, result) {
      console.log(result);
      if (!error) {
        Router.go(Contracts.findOne({ _id: result }).url);
      }
    });

  } else {
    //goes to existing one
    Router.go(existingDelegation.url);
  }
}

/***
* sends the votes from a delegator to be put on hold on a contract until delegate approves deal.
* @param {string} source - identity assigning the tokens (usually currentUser)
* @param {string} target - identity that will get a request to approve this contract (profile clicked)
* @param {number} quantity - amount of votes being used
* @param {object} conditions - specified conditions for this delegation
***/
let _sendDelegation = (sourceId, targetId, quantity, conditions) => {

  console.log('[_sendDelegation]');
  console.log(sourceId)
  console.log(targetId)
  console.log(quantity)
  console.log(conditions)


  Meteor.call('executeTransaction', sourceId, targetId, quantity, conditions, function (err, status) {
    if (err) {
      throw new Meteor.Error(err, '[_sendDelegation]: transaction failed.') ;
    } else {
      console.log('successsss')
    }
  })

}

/***
* membership contract between user and collective
* @param {string} userId - member requesting membership to collective
* @param {string} collectiveId - collective being requested
***/
let _newMembership = (userId, collectiveId) => {

}

/***
* verifies if there's already a precedent among delegator and delegate
* @param {string} delegatorId - identity assigning the tokens (usually currentUser)
* @param {string} delegateId - identity that will get a request to approve this contract (profile clicked)
***/
let _verifyDelegation = (delegatorId, delegateId) => {
  var delegationContract;
  delegationContract = Contracts.findOne({ 'signatures.0._id': delegatorId, 'signatures.1._id': delegateId });
  if (delegationContract != undefined) {
    return delegationContract;
  } else {
    /*delegationContract = Contracts.findOne({ 'signatures.1._id': delegatorId, 'signatures.0._id': delegateId });
    if (delegationContract != undefined) {
      return delegationContract;
    }
    NOTE: this second verification is not necessary, delegations should work from the delegator to the other person (once). verify on app.
    */
  }
  return false;
}

/***
* removes a contract from db
* @param {string} contractId - id of the contract to remove
***/
let _remove = (contractId) => {

  Contracts.remove({_id: contractId});

};

/***
* publishes a contract and goes to home
* @param {string} contractId - id of the contract to publish
***/
let _publish = (contractId) => {

  //Contracts.remove({_id: contractId});
  Contracts.update({ _id: contractId }, { $set: { stage: 'LIVE' } })

  Router.go('/');

  //TODO security checks of all kinds, i know, i know.

};

/***
* signs a contract with a verified user
* @param {string} contractId - contract Id to be signed
* @param {string} userObject - object containing profile of the user signing
* @param {string} role - type of role required in this signature
* NOTE: simplify this and don't store a cache of data of a user, that was a stupid idea.
****/
let _sign = (contractId, userObject, role) => {

  Contracts.update({_id: contractId}, { $push: {
    signatures:
      {
        _id: userObject._id,
        role: role,
        hash: '', //TODO implement PGP signature
        picture: userObject.profile.picture,
        firstName: userObject.profile.firstName,
        lastName: userObject.profile.lastName,
        country: userObject.profile.country
      }
  }});

};

/**
 * Changes the stage of a contract
 * @param {String} contractId - that points to contract in db
 * @param {String} stage - ['DRAFT', 'LIVE', 'FINISH']
 * @returns {Boolean}
 */

let contractStage = (contractId, stage) => {

  //TODO changes the stage of a contract.

};

Modules.both.setContractStage = contractStage;
Modules.both.signContract = _sign;
Modules.both.publishContract = _publish;
Modules.both.removeContract = _remove;
Modules.both.startMembership = _newMembership;
Modules.both.startDelegation = _newDelegation;
Modules.both.sendDelegationVotes = _sendDelegation;
Modules.both.createContract = _newDraft;
