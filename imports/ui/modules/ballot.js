import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import { globalObj } from '/lib/global';
import { Contracts } from '/imports/api/contracts/Contracts';
import { Transactions } from '/imports/api/transactions/Transactions';
import { createContract } from '/imports/startup/both/modules/Contract';
import { checkDuplicate, convertToSlug } from '/lib/utils';

/**
* @param {string} contractId - contract where this ballot belongs to
* @param {object} ballot - ballot object
*/
const _setVote = (contractId, ballot) => {
  let candidateBallot = [];

  // see candidate ballots
  if (Session.get('candidateBallot') !== undefined) {
    candidateBallot = Session.get('candidateBallot');
  }
  const multipleChoice = Session.get('contract').multipleChoice;

  // fate
  if (ballot.tick === undefined) { ballot.tick = true } else { ballot.tick = !ballot.tick; }

  // add or update ballot in memory
  let update = false;
  for (const i in candidateBallot) {
    if (!multipleChoice) {
      candidateBallot[i].ballot.tick = false;
    }
    if (candidateBallot[i].contractId === contractId) {
      if (candidateBallot[i].ballot._id === ballot._id) {
        candidateBallot[i].ballot = ballot;
        update = true;
      }
    }
  }
  if (!update) {
    candidateBallot.push({
      contractId: contractId,
      ballot: ballot,
    });
  }

  // save to session var
  Session.set('candidateBallot', candidateBallot);
  return ballot.tick;
};

/**
* @summary gets a user ballot value from a ledger
* @param {object} ledger - ledger to be analyzed
* @param {object} userId - userId to be checked
* @param {object} ballotId - ballotId value to verify
*/
const _getVoteFromLedger = (ledger, userId, ballotId) => {
  for (let k = parseInt(ledger.length - 1, 10); k >= 0; k -= 1) {
    if (ledger[k].entityId === userId && ledger[k].transactionType === 'INPUT') {
      for (const j in ledger[k].ballot) {
        if (ledger[k].ballot[j]._id === ballotId) {
          return ledger[k].ballot[j].tick;
        }
      }
    }
  }
  return false;
};

/**
* @summary returns ballot value for a given a user
* @param {string} contractId - contract where this ballot belongs to
* @param {object} ballotId - ballotId to check
*/
const _getVote = (contractId, ballotId) => {
  if (Session.get('rightToVote') === true && Session.get('contract').stage === 'LIVE') {
    // check current live vote
    const votes = Session.get('candidateBallot');
    if (votes !== undefined) {
      for (const i in votes) {
        if (votes[i].contractId === contractId && votes[i].ballot._id === ballotId) {
          return votes[i].ballot.tick;
        }
      }
    }
  }
  // check existing vote present in contract ledger
  return _getVoteFromLedger(Session.get('contract').wallet.ledger, Meteor.userId(), ballotId);
};

/**
* @summary checks if at least one item from ballot has been checked for voting
*/
const _ballotReady = () => {
  const votes = Session.get('candidateBallot');
  for (const i in votes) {
    if (votes[i].ballot.tick === true) {
      return true;
    }
  }
  return false;
};


/**
* @summary keeps only boolean true values in ballot
* @param {object} ballot - ballot object
* @return {object} options - array with only ticked true ballot options
*/
const _purgeBallot = (options) => {
  const finalBallot = [];
  for (const i in options) {
    if (options[i].ballot.tick === true) {
      finalBallot.push(options[i].ballot);
    }
  }
  return finalBallot;
};

/**
* @summary counts the votes in a given ballot
* @param {array} scoreboard - array with all ballots to do counting on
* @param {ballot} ballot - ballot to which compare existence in scoreboard
* @param {number} quantity - amount of votes to add
* @return {array} scoreboard - result board
*/
const _countVotes = (scoreboard, ballot, quantity) => {
  for (const i in scoreboard) {
    if (scoreboard[i]._id === ballot._id) {
      // add votes to exsting item
      scoreboard[i].votes += quantity;
      return scoreboard;
    }
  }
  // new item in ballot
  ballot.votes = quantity;
  scoreboard.push(ballot);
  return scoreboard;
};


/**
* @summary shows the results of the current poll
* @param {object} contract - contract to check results on
* @return {array} results - array with a statistical object for every item in the ballot
*/
const _showResults = (contract) => {
  let results = [];
  const ledger = contract.wallet.ledger;
  const ledgerIds = ledger.map(x => x.txId);

  // add votes
  Transactions.find({ _id: { $in: ledgerIds } }).forEach((transaction) => {
    const ballots = transaction.condition.ballot;
    if (ballots !== undefined && ballots.length > 0) {
      const quantity = (transaction.output.quantity / ballots.length);
      ballots.forEach((ballot) => {
        results = _countVotes(results, ballot, quantity);
      });
    }
  });

  // get stats
  let totalvotes = 0;
  results.forEach(result => (totalvotes += result.votes));

  // set percentage
  for (const result of results) {
    result.percentage = ((result.votes * 100) / totalvotes);
  }

  return results;
};

/**
* @summary updates contract execution status based on final results
* @param {object} contract - contract to check results on
* @param {object} results - object with poll results
*/
const _updateExecutionStatus = (contract, results) => {
  // check result
  let winner;
  let topvotes = 0;
  for (const i in results) {
    if (results[i].votes > topvotes) {
      topvotes = results[i].votes;
      winner = results[i].mode;
    }
  }
  if (topvotes === 0) {
    winner = 'NONE';
  }
  if (contract.stage === 'LIVE') {
    const contractId = contract._id;
    switch (winner) {
      case 'AUTHORIZE':
        Contracts.update({ _id: contractId }, { $set: { executionStatus: 'APPROVED', stage: 'FINISH' } });
        break;
      case 'REJECT':
        Contracts.update({ _id: contractId }, { $set: { executionStatus: 'REJECTED', stage: 'FINISH' } });
        break;
      case 'FORK':
        Contracts.update({ _id: contractId }, { $set: { executionStatus: 'ALTERNATIVE', stage: 'FINISH' } });
        break;
      default:
        Contracts.update({ _id: contractId }, { $set: { executionStatus: 'VOID', stage: 'FINISH' } });
    }
  }
};

/**
* @summary adds a choice to the ballot from an existing proposal
* @param {string} contractId - contract
* @param {string} forkId - choice id
* @return {boolean} value - succesfull add
*/
const _addChoiceToBallot = (contractId, forkId) => {
  const dbContract = Contracts.findOne({ _id: forkId });
  if (dbContract !== undefined) {
    if (checkDuplicate(Contracts.findOne(contractId, { ballot: { _id: dbContract._id } }).ballot, dbContract._id) === false) {
      const rankVal = parseInt(Contracts.findOne({ _id: contractId }).ballot.length, 10) + 1;
      Contracts.update(contractId, { $push: {
        ballot:
        {
          _id: dbContract._id,
          mode: 'FORK',
          url: dbContract.url,
          label: dbContract.title,
          rank: rankVal,
        },
      } });
      Session.set('duplicateFork', false);
      if (Contracts.findOne({ _id: dbContract._id }).stage === 'DRAFT') {
        Session.set('draftOptions', true);
      }
      Session.set('dbContractBallot', Contracts.findOne({ _id: contractId }, { reactive: false }).ballot);
      return true;
    }
    Session.set('duplicateFork', true);
    return false;
  }
};

/**
* @summary verifies if there's an option in the ballot that is still a draft
* @param {object} ballot - ballot to check
*/
const _verifyDraftFork = (ballot) => {
  let draftFork = false;
  for (const i in ballot) {
    const choice = Contracts.findOne({ _id: ballot[i]._id });
    if (choice.stage === 'DRAFT') {
      draftFork = true;
      break;
    }
  }
  Session.set('draftOptions', draftFork);
};

/**
* @summary generates a new contract that automatically goes as option in the ballot
*/
const _forkContract = () => {
  if (Session.get('proposalURLStatus') === 'AVAILABLE') {
    var contract = createContract(convertToSlug(Session.get('newProposal')), Session.get('newProposal'))[0];

    if (contract) {
      if (_addChoiceToBallot(Session.get('contract')._id, contract._id)) {
        contract = Contracts.findOne({ _id: Session.get('contract')._id }, { reactive: false });
        Session.set('dbContractBallot', contract.ballot);
        globalObj.ProposalSearch.search('');
        document.getElementById('searchInput').innerHTML = '';
        Session.set('proposalURLStatus', 'UNAVAILABLE');
        Session.set('createProposal', false);
        Session.set('emptyBallot', false);
        _verifyDraftFork(contract.ballot);
      }
    } else {
      Session.set('duplicateFork', true);
    }
  }
};

/*
const _quickContract = (keyword) => {
  console.log('[createContract] new contract with keyword: ' + keyword);
  //Adds a new contract to db, returns created insert
  if (keyword != undefined || keyword != '') {
    var slug = convertToSlug(keyword);
  } else {
    var slug = convertToSlug('draft-' + Meteor.userId());
  }

  var creationDate = new Date;
  creationDate.setDate(creationDate.getDate() + 1);
  console.log('[createContract] new contract by user: ' + Meteor.userId());

  if (keyword != '') {
    //Creates new contract:
    console.log('[createContract] contract being created...');
    return Contracts.insert({ title: keyword });

  }
}
*/

/**
* @summary updates the ranking of an option in a ballot
* @param {string} contractId - contract
* @param {array} sortedBallotIDs - available options in this ballot
*/
const _updateBallotRank = (contractId, sortedBallotIDs) => {
  const contract = Contracts.findOne({ _id: contractId });
  const ballot = contract.ballot;
  for (const i in sortedBallotIDs) {
    for (const k in ballot) {
      if (ballot[k]._id === sortedBallotIDs[i]) {
        ballot[k].rank = parseInt(i, 10) + 1;
        break;
      }
    }
  }
  contract.ballot = ballot;
  _verifyDraftFork(ballot);
  Contracts.update({ _id: contractId }, { $set: { ballot: contract.ballot } });
};

/**
* @summary removes an option froim a ballot
* @param {string} contractId - contract
* @param {string} forkId - choice id
*/
const _removeFork = (contractId, forkId) => {
  console.log(`removing fork ${contractId} & ${forkId}`);
  Contracts.update({ _id: contractId }, { $pull: {
    ballot:
      { _id: forkId },
  } });
};

/**
* @summary verifies if all conditions are met to execute a contract
* @param {string} contractId - contract
* @param {string} forkId - choice id
* @return {boolean} true if ready, false if not
*/
const _verifyContractExecution = () => {
  if (Session.get('emptyBallot') && Session.get('contract').ballotEnabled) {
    return false;
  } else if (Session.get('unauthorizedFork') && Session.get('contract').ballotEnabled) {
    return false;
  } else if (Session.get('missingTitle')) {
    return false;
  } else if (Session.get('mistypedTitle')) {
    return false;
  } else if (Session.get('duplicateURL')) {
    return false;
  } else if (Session.get('noVotes')) {
    return false;
  } else if (Session.get('draftOptions') && Session.get('contract').ballotEnabled) {
    return false;
  } else if (!Session.get('rightToVote')) {
    return false;
  }
  if (Session.get('contract').kind === 'VOTE' && Session.get('contract').stage === 'LIVE') {
    if (!_ballotReady()) {
      return false;
    }
  }
  if (Session.get('newVote') !== undefined) {
    if (Session.get('newVote').mode === 'PENDING' || Session.get('newVote').mode === undefined) {
      return true;
    }
    return false;
  }
  return true;
};

export const contractReady = _verifyContractExecution;
export const addChoiceToBallot = _addChoiceToBallot;
export const verifyDraftFork = _verifyDraftFork;
export const removeFork = _removeFork;
export const updateBallotRank = _updateBallotRank;
export const updateExecutionStatus = _updateExecutionStatus;
export const showResults = _showResults;
export const purgeBallot = _purgeBallot;
export const ballotReady = _ballotReady;
export const forkContract = _forkContract;
export const setVote = _setVote;
export const getVote = _getVote;
