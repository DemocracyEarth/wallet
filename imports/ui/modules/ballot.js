import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { TAPi18n } from 'meteor/tap:i18n';

import { globalObj } from '/lib/global';
import { Contracts } from '/imports/api/contracts/Contracts';
import { Transactions } from '/imports/api/transactions/Transactions';
import { createContract, delegate } from '/imports/startup/both/modules/Contract';
import { checkDuplicate, convertToSlug } from '/lib/utils';
import { displayNotice } from '/imports/ui/modules/notice';
import { displayModal } from '/imports/ui/modules/modal';
import { transact } from '/imports/api/transactions/transaction';
import { Wallet } from '/imports/ui/modules/Wallet';

/**
* @summary sets the vote on the ballot with tick
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
    if (candidateBallot[i].contractId === contractId) {
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
      contractId: contractId,
      ballot: ballot,
    });
  }

  // save to session var
  Session.set('candidateBallot', candidateBallot);
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
* @summary returns the type of object (contract or user) based on wallet info
* @return {object} contract
*/
const getTargetObject = (wallet) => {
  let contract;
  switch (wallet.voteType) {
    case 'DELEGATION':
      contract = Contracts.findOne({ _id: wallet.targetId });
      if (!contract) {
        return Meteor.users.findOne({ _id: wallet.targetId });
      }
      return contract;
    case 'VOTE':
    default:
      return Contracts.findOne({ _id: wallet.targetId });
  }
};

/**
* @summary executes an already configured vote from a power bar
* @param {Wallet} wallet where the vote to be executed takes its input from
* @param {function} cancel what happens if execution is cancelled
* @param {boolean} removal if operation aims to remove all votes from ballot
*/
const _executeVote = (wallet, cancel, removal) => {
  let vote;
  let showBallot;
  let finalBallot;
  let finalCaption;
  let settings;
  let iconPic;
  let actionLabel;
  let titleLabel;
  let boolProfile;
  let dictionary;
  let delegateUser;
  let delegateContractTitle;
  let delegateProfileId;
  const target = getTargetObject(wallet);
  const votesInBallot = wallet.inBallot;
  const newVotes = parseInt(wallet.allocateQuantity - votesInBallot, 10);
  const votes = parseInt(votesInBallot + newVotes, 10);

  const close = () => {
    Session.set('dragging', false);
    const newWallet = new Wallet(Meteor.user().profile.wallet, Session.get(wallet.voteId).targetId, wallet.voteId);
    Session.set(wallet.voteId, newWallet);
  };

  // TODO delegation use case, only thought for contracts still.

  switch (wallet.voteType) {
    case 'DELEGATION':
      if (target.signatures) {
        for (let i = 0; i < target.signatures.length; i += 1) {
          delegateUser = Meteor.users.findOne({ _id: target.signatures[i]._id });
          if (delegateUser) { break; }
        }
        delegateContractTitle = target.title;
      } else {
        delegateUser = target;
        delegateContractTitle = `${convertToSlug(Meteor.user().username)}-${convertToSlug(delegateUser.username)}`;
      }
      delegateProfileId = delegateUser._id;
      iconPic = 'images/modal-delegation.png';
      titleLabel = TAPi18n.__('send-delegation-votes');
      actionLabel = TAPi18n.__('delegate');
      boolProfile = true;
      showBallot = false;
      dictionary = 'delegations';

      // NOTE: this stuff is legacy, should definitely be reviewed ASAP
      settings = {
        title: delegateContractTitle,
        signatures: [
          {
            username: Meteor.user().username,
          },
          {
            username: delegateUser.username,
          },
        ],
        condition: {
          transferable: Session.get('contract').transferable,
          portable: Session.get('contract').portable,
          tags: Session.get('contract').tags,
        },
        currency: 'VOTES',
        kind: Session.get('contract').kind,
        contractId: Session.get('contract')._id,
      };
      break;
    case 'VOTE':
    default:
      iconPic = 'images/modal-vote.png';
      titleLabel = TAPi18n.__('place-vote');
      actionLabel = TAPi18n.__('vote');
      boolProfile = false;
      showBallot = true;
      finalBallot = _purgeBallot(Session.get('candidateBallot'));
      dictionary = 'votes';
      settings = {
        condition: {
          tags: target.tags,
          ballot: finalBallot,
        },
        currency: 'VOTES',
        kind: target.kind,
        contractId: wallet.targetId,
      };

      if (finalBallot.length === 0 && removal !== true) {
        displayNotice('empty-values-ballot', true);
        return;
      }
      break;
  }

  // voting cases

  if (newVotes < 0 || votes === 0 || removal === true) {
    // subtract votes
    if (votes === 0) {
      finalCaption = TAPi18n.__(`retrieve-all-${dictionary}`);
      showBallot = false;
      actionLabel = TAPi18n.__('remove');
    } else {
      finalCaption = TAPi18n.__(`retrieve-${dictionary}-warning`).replace('<quantity>', votes.toString()).replace('<retrieve>', Math.abs(newVotes).toString());
    }
    vote = () => {
      transact(
        wallet.targetId,
        Meteor.user()._id,
        parseInt(Math.abs(newVotes), 10),
        settings,
        close
      );
    };
  } else if ((votesInBallot === 0) || (newVotes === 0)) {
    // insert votes
    let voteQuantity;
    if (newVotes === 0) {
      finalCaption = TAPi18n.__('place-votes-change-ballot').replace('<quantity>', wallet.allocateQuantity);
      voteQuantity = 0;
    } else {
      finalCaption = TAPi18n.__(`place-${dictionary}-warning`).replace('<quantity>', wallet.allocateQuantity);
      voteQuantity = parseInt(wallet.allocateQuantity, 10);
    }
    vote = () => {
      switch (wallet.voteType) {
        case 'DELEGATION':
          delegate(
            Meteor.userId(),
            delegateUser._id,
            voteQuantity,
            settings,
            close
          );
          break;
        case 'VOTE':
        default:
          transact(
            Meteor.user()._id,
            wallet.targetId,
            voteQuantity,
            settings,
            close
          );
      }
    };
  } else if (newVotes > 0) {
    // add votes
    finalCaption = TAPi18n.__(`place-more-${dictionary}-warning`).replace('<quantity>', votes.toString()).replace('<add>', newVotes);
    vote = () => {
      transact(
        Meteor.user()._id,
        wallet.targetId,
        parseInt(newVotes, 10),
        settings,
        close
      );
    };
  }

  // ask confirmation
  displayModal(
    true,
    {
      icon: iconPic,
      title: titleLabel,
      message: finalCaption,
      cancel: TAPi18n.__('not-now'),
      action: actionLabel,
      displayProfile: boolProfile,
      displayBallot: showBallot,
      ballot: finalBallot,
      profileId: delegateProfileId,
    },
    vote,
    cancel
  );
};

/**
* @summary gets the quantity of votes a given user has on a ledger
* @param {object} ledger - ledger to be analyzed
* @param {object} userId - userId to be checked
*/
const _getVoteQuantity = (ledger, userId) => {
  let votes = 0;
  for (const i in ledger) {
    if (ledger[i].entityId === userId) {
      switch (ledger[i].transactionType) {
        case 'INPUT':
          votes += ledger[i].quantity;
          break;
        case 'OUTPUT':
        default:
          votes -= ledger[i].quantity;
          break;
      }
    }
  }
  return votes;
};

/**
* @summary evaluate if it's last present setting on ledger.
* @param {object} ledger - ledger to be analyzed
* @param {object} userId - userId to be checked
* @param {object} ballotId - ballotId value to verify
*/
const _getTickFromLedger = (ledger, userId, ballotId) => {
  const votes = _getVoteQuantity(ledger, userId);
  // evaluate if it's last present setting on ledger.
  if (votes > 0) {
    for (let index = ledger.length - 1; index >= 0; index -= 1) {
      if (ledger[index].entityId === userId) {
          for (const j in ledger[index].ballot) {
            if (ledger[index].ballot[j]._id.toString() === ballotId.toString()) {
              return true;
            }
          }
        break;
      }
    }
  }
  return false;
};

/**
* @summary returns tick value for a given ballot
* @param {string} contractId - contract where this ballot belongs to
* @param {object} ballot - ballot object from template
* @return {boolean} tick value
*/
const _getTickValue = (contractId, ballot) => {
  // first verifies if the user did any interaction regarding ballot
  if (Session.get('rightToVote') === true && Session.get('contract').stage === 'LIVE') {
    // check current live vote
    const votes = Session.get('candidateBallot');
    if (votes !== undefined) {
      for (const i in votes) {
        if (votes[i].contractId === contractId && votes[i].ballot._id.toString() === ballot._id.toString()) {
          if (votes[i].ballot.tick !== undefined) {
            return votes[i].ballot.tick;
          }
        }
      }
    }
  }
  // check existing vote present in contract ledger
  const ledgervote = _getTickFromLedger(Session.get('contract').wallet.ledger, Meteor.userId(), ballot._id);
  return ledgervote;
};

/**
* @summary sets candidate ballot of user for given contract
* @param {string} contractId - contract where this ballot belongs to
* @param {object} ballot - ballot object from template
* @return {boolean} tick value
*/
const _candidateBallot = (userId) => {
  const candidateBallot = [];
  const ledger = Session.get('contract').wallet.ledger;
  const votes = _getVoteQuantity(ledger, userId);
  if (votes > 0) {
    for (let index = ledger.length - 1; index >= 0; index -= 1) {
      if (ledger[index].entityId === userId) {
        for (const j in ledger[index].ballot) {
          candidateBallot.push({
            contractId: Session.get('contract')._id,
            ballot: ledger[index].ballot[j],
          });
        }
        break;
      }
    }
    Session.set('candidateBallot', candidateBallot);
  }
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
export const getTickValue = _getTickValue;
export const candidateBallot = _candidateBallot;
export const executeVote = _executeVote;
