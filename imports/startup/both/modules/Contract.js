import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Contracts } from '../../../api/contracts/Contracts';
import { shortUUID } from './crypto';

/**
* generate a new empty draft
* @param {string} keyword - name of the contract to be specifically used for this delegation
* @param {string} title - title of the contract without slug
* @return {object} contract - if it's empty then call router with new contract,
* otherwise returns contract object from db
*/
let _newDraft = (keyword, title) => {
  //Empty Contract
  if (keyword == undefined) {
    if (!Contracts.findOne({keyword: 'draft-' + Meteor.userId()})) {
      Contracts.insert({ keyword: 'draft-' + Meteor.userId() });
    }
    var id = Contracts.findOne({keyword: 'draft-' + Meteor.userId()})._id;
    Router.go('/vote/draft?id=' + id);
  //Has title & keyword
  } else {
    if (!Contracts.findOne({keyword: keyword})) {
      if (!title) {
        Contracts.insert({ keyword: keyword });
      } else {
        Contracts.insert({ keyword: keyword, title: title });
      }
      return Contracts.find({ keyword: keyword }).fetch();
    } else {
      return false;
    }
  }
}

/***
* generate delegation contract between two identities.
* @param {string} delegatorId - identity assigning the tokens (usually currentUser)
* @param {string} delegateId - identity that will get a request to approve this contract (profile clicked)
* @param {object} settings - basic settings for this contract
***/
let _newDelegation = (delegatorId, delegateId, settings) => {
  var finalTitle = new String();
  var existingDelegation = _verifyDelegation(delegatorId, delegateId);
  if (!existingDelegation) {
    //creates new
    if (!Contracts.findOne({keyword: settings.title})) {
      //uses given title
      finalTitle = settings.title;
    } else {
      //adds random if coincidence among people with similar names happened
      finalTitle = settings.title + shortUUID();
    }
    var newDelegation =
    {
      keyword: finalTitle,
      title: TAPi18n.__('delegation-voting-rights'),
      kind: 'DELEGATION',
      description: TAPi18n.__('default-delegation-contract'),
      signatures: [
        {
          _id: delegatorId,
          username: settings.signatures[0].username,
          role: 'DELEGATOR',
          status: 'PENDING'
        },
        {
          _id: delegateId,
          username: settings.signatures[1].username,
          role: 'DELEGATE',
          status: 'PENDING'
        }
      ]
    };

    Meteor.call('insertContract', newDelegation, function(error, result) {
      if (!error) {
        Router.go(Contracts.findOne({ _id: result }).url);
      }
    });
  } else {
    // goes to existing one
    Router.go(existingDelegation.url);
  }
};

/***
* sends the votes from a delegator to be put on hold on a contract until delegate approves deal.
* @param {string} source - identity assigning the tokens (usually currentUser)
* @param {string} target - identity that will get a request to approve this contract (profile clicked)
* @param {number} quantity - amount of votes being used
* @param {object} conditions - specified conditions for this delegation
***/
const _sendDelegation = (sourceId, targetId, quantity, conditions, newStatus) => {
  Meteor.call('executeTransaction', sourceId, targetId, quantity, conditions, newStatus, function (err, result) {
    if (err) {
      throw new Meteor.Error(err, '[_sendDelegation]: transaction failed.');
    } else {
      //update contract status\
      _updateContractSignatures(result);
      //Session.set('newVote', new Wallet(Meteor.user().profile.wallet));
    }
  })
};


/***
* signals political preference of user regarding issue proposed in contract
* @param {string} userId - identity assigning the tokens (usually currentUser)
* @param {string} contractId - identity that will get a request to approve this contract (profile clicked)
* @param {number} quantity - amount of votes being used
* @param {object} ballot - specified conditions for this delegation
***/
let _vote = (userId, contractId, quantity, ballot) => {
  Meteor.call('vote', userId, contractId, quantity, ballot, function (err, result) {
    if (err) {
      throw new Meteor.Error(err, '[_vote]: vote failed.') ;
    } else {
      //update contract status\
      console.log('[_vote] vote successful.')
      //_updateContractSignatures(result);
      //Session.set('newVote', new Wallet(Meteor.user().profile.wallet));
    }
  })
};

/***
* updates the status of the signatures in the contract
***/
let _updateContractSignatures = (status) => {
  var signatures = Session.get('contract').signatures;
  for (signer in signatures) {
    if (signatures[signer]._id == Meteor.user()._id) {
      switch(signatures[signer].status) {
        case 'PENDING':
          if (status != undefined) {
            signatures[signer].status = status;
            break;
          }
          signatures[signer].status = 'CONFIRMED';
          break;
      }
      break;
    }
  };
  Contracts.update(Session.get('contract')._id, { $set : { signatures : signatures } });
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
* verifies status of signature from identity in a contract
* @param {object} signatures - object containing signatures
* @param {object} signerId - identity of signer to verify
* @param {boolean} getStatus - if boolean value shall be returned rather than string
***/
let _signatureStatus = (signatures, signerId, getStatus) => {
  var label = new String();
  var pending = new Boolean(false);
  for (var i = 0; i < signatures.length; i++) {
    if (signatures[i]._id == signerId) {
      switch (signatures[i].role) {
        case 'DELEGATOR':
          label = TAPi18n.__('delegator');
          break;
        case 'DELEGATE':
          label = TAPi18n.__('delegate');
          break;
        case 'AUTHOR':
          label = TAPi18n.__('author');
      }
      switch (signatures[i].status) {
        case 'PENDING':
          label += " " + TAPi18n.__('signature-pending');
          pending = true;
          break;
        case 'REJECTED':
          label += " " + TAPi18n.__('signature-rejected');
          pending = true;
          break;
        default:
          pending = false;
          break;
      }
      break;
    }
  }
  if (getStatus == undefined || getStatus == false) {
    return label;
  } else {
    if (signatures.length > 0) {
      if (signatures[i] != undefined) {
        return signatures[i].status;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}

/***
* removes a contract from db
* @param {string} contractId - id of the contract to remove
***/
let _remove = (contractId) => {

  Contracts.remove({_id: contractId});

  //remove any reference to this in other contract ballots
  var newballot = new Array();
  var forks = Contracts.find({ collectiveId: Meteor.settings.public.Collective._id,  ballot: { $elemMatch: { _id: contractId }}}).fetch();

  for (i in forks) {
    newballot = undefined;
    for (k in forks[i].ballot) {
      if (forks[i].ballot[k]._id == contractId) {
        forks[i].ballot.splice(k, 1);
        newballot = forks[i].ballot;
        break;
      }
    }
    if (newballot != undefined) {
      Contracts.update({ _id: forks[i]._id }, { $set: { ballot : newballot }});
    }
  }

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
        hash: '', //TODO pending crypto TBD
        username: userObject.username,
        status: 'CONFIRMED'
      }
  }});

};


/***
* removes a signature from a contract
* @param {string} contractId - contract Id to be signed
* @param {string} userId - user signature to remove.
****/
let _removeSignature = (contractId, userId) => {

  Contracts.update({_id: contractId}, { $pull: {
    signatures:
      {
        _id: userId
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

let _rightToVote = (contract) => {
  if (contract.kind == 'DELEGATION') {
    for (i in contract.signatures) {
      if (contract.signatures[i]._id == Meteor.user()._id) {
        return true;
      }
    }
    return false;
  }
  return true;
};

export const rightToVote = _rightToVote;
export const signatureStatus = _signatureStatus;
export const setContractStage = contractStage;
export const signContract = _sign;
export const removeSignature = _removeSignature;
export const publishContract = _publish;
export const removeContract = _remove;
export const startMembership = _newMembership;
export const startDelegation = _newDelegation;
export const sendDelegationVotes = _sendDelegation;
export const createContract = _newDraft;
export const vote = _vote;
