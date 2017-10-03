import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { TAPi18n } from 'meteor/tap:i18n';

import { Contracts } from '../../../api/contracts/Contracts';
import { shortUUID } from './crypto';
import { transact } from '../../../api/transactions/transaction';

/**
* @summary generate a new empty draft
* @param {string} keyword - name of the contract to be specifically used for this delegation
* @param {string} title - title of the contract without slug
* @return {object} contract - if it's empty then call router with new contract,
* otherwise returns contract object from db
*/
const _newDraft = (newkeyword, newtitle) => {
  // empty Contract
  if (newkeyword === undefined) {
    if (!Contracts.findOne({ keyword: `draft-${Meteor.userId()}` })) {
      Contracts.insert({ keyword: `draft-${Meteor.userId()}` });
    }
    const contract = Contracts.findOne({ keyword: `draft-${Meteor.userId()}` });
    if (Meteor.user()) {
      _sign(contract._id, Meteor.user(), 'AUTHOR');
    }
    /*
    @NOTE: we are deprecating session.get('contract') everywhere.
    if (Meteor.Device.isPhone()) {
      Session.set('contract', contract);
    }
    */
    return contract;
    // Router.go(`/vote/draft?id=${contract._id}`);
  // has title & keyword, used for forks
  } else if (!Contracts.findOne({ keyword: newkeyword })) {
    if (!newtitle) {
      Contracts.insert({ keyword: newkeyword });
    } else {
      Contracts.insert({ keyword: newkeyword, title: newtitle });
    }
    return Contracts.find({ keyword: newkeyword }).fetch();
  }
  return false;
};

/**
* @summary verifies if there's already a precedent among delegator and delegate
* @param {string} delegatorId - identity assigning the tokens (usually currentUser)
* @param {string} delegateId - identity that will get a request to approve
*/
const _getDelegationContract = (delegatorId, delegateId) => {
  const delegationContract = Contracts.findOne({ 'signatures.0._id': delegatorId, 'signatures.1._id': delegateId }) || Contracts.findOne({ 'signatures.0._id': delegateId, 'signatures.1._id': delegatorId });
  if (delegationContract !== undefined) {
    return delegationContract;
  }
  return false;
};

/**
* @summary updates the status of the signatures in the contract
* @param {string} status the status code to save in the contract signature
*/
const _updateContractSignatures = (status) => {
  const signatures = Session.get('contract').signatures;
  for (const signer in signatures) {
    if (signatures[signer]._id === Meteor.user()._id) {
      switch (signatures[signer].status) {
        case 'PENDING':
          if (status !== undefined) {
            signatures[signer].status = status;
            break;
          }
          signatures[signer].status = 'CONFIRMED';
          break;
        default:
          break;
      }
    }
  }
  Contracts.update(Session.get('contract')._id, { $set: { signatures: signatures } });
};

/**
* @summary sends the votes from a delegator to be put on hold until delegate approves deal.
* @param {string} source - identity assigning the tokens (usually currentUser)
* @param {string} target - identity that will get a request to approve
* @param {number} quantity - amount of votes being used
* @param {object} conditions - specified conditions for this delegation
*/
const _sendDelegation = (sourceId, targetId, quantity, conditions, newStatus) => {
  /*
    Meteor.call('executeTransaction', sourceId, targetId, quantity, conditions, newStatus, function (err, result) {
    if (err) {
      throw new Meteor.Error(err, '[_sendDelegation]: transaction failed.');
    } else {
      // update contract status\
      _updateContractSignatures(result);
    }
  });*/

  console.log(`sourceId ${sourceId},
    targetId ${targetId},
    quantity ${quantity},
    conditions ${conditions},
    newStatus ${newStatus}`
  );

  const txId = transact(sourceId, targetId, quantity, conditions);
  if (newStatus !== undefined && txId !== undefined) {
    _updateContractSignatures(newStatus);
  }
};

/**
* @summary generate delegation contract between two identities.
* @param {string} delegatorId - identity assigning the tokens (usually currentUser)
* @param {string} delegateId - identity that will get a request to approve
* @param {number} votes - transaction size in votes
* @param {object} settings - additional settings to be stored on the ledger
* @param {function} callback - once everything's done, what is left to do?
* @param {boolean} instantaneous - if its a fast, instantaneous delegation
*/
const _newDelegation = (delegatorId, delegateId, votes, settings) => {
  let finalTitle;
  if (_getDelegationContract(delegatorId, delegateId)) { return false };

  // creates new delegation contract
  if (!Contracts.findOne({ keyword: settings.title })) {
    // uses given title
    finalTitle = settings.title;
  } else {
    // adds random if coincidence among people with similar names happened
    finalTitle = settings.title + shortUUID();
  }

  const newDelegation =
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
          status: 'CONFIRMED',
        },
        {
          _id: delegateId,
          username: settings.signatures[1].username,
          role: 'DELEGATE',
          status: 'CONFIRMED',
        },
      ],
    };

  const newContract = Contracts.insert(newDelegation);
  return Contracts.findOne({ _id: newContract });
};

/**
* @summary verifies status of signature from identity in a contract
* @param {object} signatures - object containing signatures
* @param {object} signerId - identity of signer to verify
* @param {boolean} getStatus - if boolean value shall be returned rather than string
*/
const _signatureStatus = (signatures, signerId, getStatus) => {
  let label = String();
  let i = 0;
  for (i = 0; i < signatures.length; i += 1) {
    if (signatures[i]._id === signerId) {
      switch (signatures[i].role) {
        case 'DELEGATOR':
          label = TAPi18n.__('delegator');
          break;
        case 'DELEGATE':
          label = TAPi18n.__('delegate');
          break;
        default:
          if (Meteor.Device.isPhone()) {
            label = `<a id="removeSignature">${TAPi18n.__('remove')}</a>`;
          } else {
            label = TAPi18n.__('author');
          }
      }
      switch (signatures[i].status) {
        case 'PENDING':
          label += ` ${TAPi18n.__('signature-pending')}`;
          break;
        case 'REJECTED':
          label += ` ${TAPi18n.__('signature-rejected')}`;
          break;
        default:
          break;
      }
      break;
    }
  }
  if (getStatus === undefined || getStatus === false) {
    return label;
  } else if (signatures.length > 0) {
    if (signatures[i] !== undefined) {
      return signatures[i].status;
    }
    return false;
  }
  return false;
};

/**
* @summary removes a contract from db
* @param {string} contractId - id of the contract to remove
*/
const _remove = (contractId) => {
  Contracts.remove({ _id: contractId });
  // remove any reference to this in other contract ballots
  let newballot = [];
  const forks = Contracts.find(
    {
      collectiveId: Meteor.settings.public.Collective._id,
      ballot: { $elemMatch: { _id: contractId } },
    }).fetch();

  for (const i in forks) {
    newballot = undefined;
    for (const k in forks[i].ballot) {
      if (forks[i].ballot[k]._id === contractId) {
        forks[i].ballot.splice(k, 1);
        newballot = forks[i].ballot;
        break;
      }
    }
    if (newballot !== undefined) {
      Contracts.update({ _id: forks[i]._id }, { $set: { ballot: newballot } });
    }
  }
};

/**
* publishes a contract and goes to home
* @param {string} contractId - id of the contract to publish
*/
const _publish = (contractId) => {
  Contracts.update({ _id: contractId }, { $set: { stage: 'LIVE' } });
  Router.go('/');
  // TODO security checks of all kinds, i know, i know.
};

/**
* @summary signs a contract with a verified user
* @param {string} contractId - contract Id to be signed
* @param {string} userObject - object containing profile of the user signing
* @param {string} role - type of role required in this signature
* NOTE: simplify this and don't store a cache of data of a user, that was a stupid idea.
*/
const _sign = (contractId, userObject, userRole) => {
  let found = false;
  const contract = Contracts.findOne({ _id: contractId });

  // avoids signature duplication
  if (contract.signatures) {
    contract.signatures.forEach((item) => { if (item._id === userObject._id) { found = true; return; } });
  }

  // signs
  if (!found) {
    Contracts.update({ _id: contractId }, { $push: {
      signatures:
      {
        _id: userObject._id,
        role: userRole,
        hash: '', // TODO pending crypto TBD
        username: userObject.username,
        status: 'CONFIRMED',
      },
    } });
  }
};


/**
* @summary removes a signature from a contract
* @param {string} contractId - contract Id to be signed
* @param {string} userId - user signature to remove.
****/
const _removeSignature = (contractId, userId) => {
  Contracts.update({ _id: contractId }, { $pull: {
    signatures: {
      _id: userId,
    },
  } });
};

/**
 * @summary Changes the stage of a contract
 * @param {String} contractId - that points to contract in db
 * @param {String} stage - ['DRAFT', 'LIVE', 'FINISH']
 * @returns {Boolean}
 */

const contractStage = (contractId, stage) => {

  // TODO changes the stage of a contract.

};

const _rightToVote = (contract) => {
  if (contract.kind === 'DELEGATION') {
    for (const i in contract.signatures) {
      if (contract.signatures[i]._id === Meteor.user()._id) {
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
export const createDelegation = _newDelegation;
export const sendDelegationVotes = _sendDelegation;
export const createContract = _newDraft;
export const getDelegationContract = _getDelegationContract;
