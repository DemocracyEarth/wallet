import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import { globalObj } from '/lib/global';
import { Contracts } from '/imports/api/contracts/Contracts';
import { Transactions } from '/imports/api/transactions/Transactions';
import { createContract } from '/imports/startup/both/modules/Contract';
import { checkDuplicate, convertToSlug } from '/lib/utils';
import { getTransactions, getVotes } from '/imports/api/transactions/transaction';
import { verifyDelegationRight, verifyVotingRight } from '/imports/startup/both/modules/User';

/**
* @summary gets the candidate ballot set by user for a specific contract
* @param {string} contractId - contract where this ballot belongs to
*/
const _getBallot = (contractId) => {
  if (Session.get('ballotManager')) {
    const manager = Session.get('ballotManager');
    for (const i in manager) {
      if (manager[i].contractId === contractId) {
        if (manager[i].candidateBallot) {
          return manager[i].candidateBallot;
        }
      }
    }
  }
  return [];
};

/**
* @summary stores a ballot in the ballot manager for a given contract
* @param {string} contractId - contract where this ballot belongs to
* @param {object} ballot a given ballot object
*/
const _setBallot = (contractId, ballot) => {
  let manager = [];
  let found = false;

  if (Session.get('ballotManager')) {
    manager = Session.get('ballotManager');
  }

  for (const i in manager) {
    if (manager[i].contractId === contractId) {
      manager[i].candidateBallot = ballot;
      found = true;
      break;
    }
  }

  if (!found) {
    manager.push({
      contractId,
      candidateBallot: ballot,
    });
  }

  Session.set('ballotManager', manager);
};

/**
* @summary sets the vote on the ballot with tick
* @param {string} contract - contract where this ballot belongs to
* @param {object} ballot - ballot object
*/
const _setVote = (contract, ballot) => {
  const candidateBallot = _getBallot(contract._id);
  const multipleChoice = contract.multipleChoice;

  // fate
  if (ballot.tick === undefined) { ballot.tick = true; } else { ballot.tick = !ballot.tick; }

  // add or update ballot in memory
  let update = false;
  for (const i in candidateBallot) {
    if (candidateBallot[i].contractId === contract._id) {
      if (!multipleChoice) {
        candidateBallot[i].ballot.tick = false;
      }
      if (candidateBallot[i].ballot._id.toString() === ballot._id.toString()) {
        candidateBallot[i].ballot = ballot;
        update = true;
      }
    }
  }
  if (!update) {
    candidateBallot.push({
      contractId: contract._id,
      ballot,
    });
  }

  // save to session var
  _setBallot(contract._id, candidateBallot);
  return ballot.tick;
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
* @summary defines if user has the right to vote on a contract
* @param {object} contract - what contract to analyze
*/
const _getRightToVote = (contract) => {
  if (!contract) { return false; }
  if (contract.kind === 'DELEGATION') {
    return verifyDelegationRight(contract.signatures);
  } else if ((contract.kind === 'VOTE' && contract.stage === 'DRAFT') || (contract.kind === 'VOTE' && contract.stage === 'LIVE')) {
    return true;
  }
  return false;
};

/**
* @summary see if user has already voted regardless of the right to vote.
* @param {object} contract - what contract to analyze
*/
const _userAlreadyVoted = (contract) => {
  if (contract.kind === 'VOTE' && contract.stage === 'DRAFT') {
    return false;
  }
  return verifyVotingRight(contract._id);
};

/**
* @summary evaluate if it's last present setting on ledger.
* @param {object} contract - what contract to analyze
* @param {object} userId - userId to be checked
* @param {object} ballotId - ballotId value to verify
* @return {object} tick value on given ballot and if an alternative is ticked
*/
const _getTickFromLedger = (contract, userId, ballotId) => {
  const election = {
    tick: false,
    alternative: false,
    onLedger: true,
  };
  const votes = getVotes(contract._id, userId);
  // console.log(votes);
  // evaluate if it's last present setting on ledger.
  if (votes > 0) {
    const last = _.last(getTransactions(userId, contract._id));
    for (const j in last.condition.ballot) {
      if (last.condition.ballot[j]._id.toString() === ballotId.toString()) {
        // return true;
        election.tick = true;
        return election;
      }
      election.alternative = true;
    }
  }
  return election;
};

/**
* @summary returns tick value for a given ballot
* @param {object} ballot - ballot object from template
* @param {object} contract - contract object being analyzed
* @return {object} tick value on given ballot and if an alternative is ticked
*/
const _getTickValue = (ballot, contract) => {
  const election = {
    tick: false,
    alternative: false,
    onLedger: false,
  };
  // first verifies if the user did any interaction regarding ballot
  if (_getRightToVote(contract) && contract.stage === 'LIVE') {
    // check current live vote
    const votes = _getBallot(contract._id);
    if (votes !== undefined) {
      for (const i in votes) {
        if (votes[i].contractId === contract._id) {
          if (votes[i].ballot._id.toString() === ballot._id.toString() && votes[i].ballot.tick !== undefined) {
            election.tick = votes[i].ballot.tick;
            // return votes[i].ballot.tick;
          } else if (votes[i].ballot._id.toString() !== ballot._id.toString() && votes[i].ballot.tick) {
            election.alternative = votes[i].ballot.tick;
          }
        }
      }
      // user ticked something
      if (election.tick || election.alternative) {
        return election;
      }
    }
  }
  // check existing vote present in contract ledger
  return _getTickFromLedger(contract, Meteor.userId(), ballot._id);
};

/**
* @summary sets candidate ballot of user for given contract
* @param {string} userId - user preferences on this ballot
* @param {string} contractId - contract where this ballot belongs to
* @return {boolean} tick value
*/
const _candidateBallot = (userId, contractId) => {
  const candidateBallot = [];
  const transactions = getTransactions(userId, contractId);
  if (transactions.length > 0) {
    const last = _.last(getTransactions(userId, contractId));
    for (const j in last.condition.ballot) {
      candidateBallot.push({
        contractId: contractId,
        ballot: last.condition.ballot[j],
      });
    }
    _setBallot(contractId, candidateBallot);
    return candidateBallot;
  }
  return [];
};

/**
* @summary checks if at least one item from ballot has been checked for voting
* @param {string} contractId - contract where this ballot belongs to
*/
const _ballotReady = (contractId) => {
  const votes = _getBallot(contractId); // Session.get('candidateBallot');
  for (const i in votes) {
    if (votes[i].ballot.tick === true) {
      return true;
    }
  }
  return false;
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
* @summary gets all the votes sent to a given contract
* @param {object} contract - contract to make voter count on
*/
const _getVoteTransactions = (contract) => {
  return _.uniq(_.pluck(_.union(
    _.pluck(Transactions.find({ 'output.entityId': contract._id }).fetch(), 'input'),
    _.pluck(Transactions.find({ 'input.entityId': contract._id }).fetch(), 'output')), 'entityId'));
};

/**
* @summary shows total unique voters on a given issue
* @param {object} contract - contract to make voter count on
* @return {number} integer with final count
*/
const _getTotalVoters = (contract) => {
  let voters = 0;
  const transactions = _getVoteTransactions(contract);

  for (const participant in transactions) {
    if (getVotes(contract._id, transactions[participant]) > 0) {
      voters += 1;
    }
  }
  return voters;
};

/**
* @summary gets the votes a contract has received on a given ballot optional
* @param {object} fork for which option is the tally being counted
*/
const _getTally = (fork) => {
  const transactions = _getVoteTransactions(fork.contract);
  let ballot = [];
  let voterTransactions = [];
  let voterVotes = 0;
  let votes = 0;
  for (const participant in transactions) {
    voterVotes = getVotes(fork.contract._id, transactions[participant]);
    if (voterVotes > 0) {
      voterTransactions = getTransactions(transactions[participant], fork.contract._id);
      ballot = voterTransactions[parseInt(voterTransactions.length - 1, 10)].condition.ballot;
      for (const tick in ballot) {
        if (ballot[tick]._id.toString() === fork._id.toString()) {
          votes += voterVotes;
        }
      }
    }
  }
  return votes;
};

/**
* @summary total votes cast for a contract
* @param {object} contract which contract
*/
const _getTallyTotal = (contract) => {
  const transactions = _getVoteTransactions(contract);
  let totalVotes = 0;
  for (const participant in transactions) {
    totalVotes += getVotes(contract._id, transactions[participant]);
  }
  return totalVotes;
};

/**
* @summary calculates the percentage of the tally for a given options
* @param {object} fork for which option is the tally being counted
*/
const _getTallyPercentage = (fork) => {
  const totalVotes = _getTallyTotal(fork.contract);
  const forkVotes = _getTally(fork);
  if (totalVotes === 0) { return 0; }
  return parseFloat((forkVotes * 100) / totalVotes, 10);
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
    let contract = createContract(convertToSlug(Session.get('newProposal')), Session.get('newProposal'))[0];

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
const _contractReady = (vote, contract) => {
  if (Session.get('emptyBallot') && contract.ballotEnabled) {
    return false;
  } else if (Session.get('unauthorizedFork') && contract.ballotEnabled) {
    return false;
  } else if (Session.get('mistypedTitle')) {
    return false;
  } else if (Session.get('duplicateURL')) {
    return false;
  } else if (Session.get('noVotes')) {
    return false;
  } else if (Session.get('draftOptions') && contract.ballotEnabled) {
    return false;
  } else if (!_getRightToVote(contract)) {
    return false;
  }
  if (vote.voteType === 'VOTE') {
    if (contract.kind === 'VOTE' && contract.stage === 'LIVE') {
      if (!_ballotReady(contract._id)) {
        return false;
      }
    }
    if (Session.get('newVote') !== undefined) {
      if (Session.get('newVote').mode === 'PENDING' || Session.get('newVote').mode === undefined) {
        return true;
      }
      return false;
    }
  }
  return true;
};

export const getTally = _getTally;
export const getTallyPercentage = _getTallyPercentage;
export const getTallyTotal = _getTallyTotal;
export const getRightToVote = _getRightToVote;
export const userAlreadyVoted = _userAlreadyVoted;
export const getBallot = _getBallot;
export const setBallot = _setBallot;
export const contractReady = _contractReady;
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
export const getTickValue = _getTickValue;
export const candidateBallot = _candidateBallot;
export const getTotalVoters = _getTotalVoters;
