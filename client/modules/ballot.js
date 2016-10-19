import {default as Modules} from "./_modules";

/*****
* @param {string} contractId - contract where this ballot belongs to
* @param {object} ballot - ballot object
******/
let _setVote = (contractId, ballot) => {
  var candidateBallot = new Array();

  //see candidate ballots
  if (Session.get('candidateBallot') != undefined) {
   candidateBallot = Session.get('candidateBallot');
  }
  var multipleChoice = Session.get('contract').multipleChoice;

  //fate
  if (ballot.tick == undefined) { ballot.tick = true } else { ballot.tick = !ballot.tick };

  //add or update ballot in memory
  var update = false;
  for (i in candidateBallot) {
    if (!multipleChoice) {
      candidateBallot[i].ballot.tick = false;
    }
    if (candidateBallot[i].contractId == contractId) {
      if (candidateBallot[i].ballot._id == ballot._id) {
        candidateBallot[i].ballot = ballot
        update = true;
      }
    }
  }
  if (!update) {
    candidateBallot.push({
      contractId: contractId,
      ballot: ballot
    })
  }

  //save to session var
  Session.set('candidateBallot', candidateBallot);
  return ballot.tick;
}

/*****
* @param {string} contractId - contract where this ballot belongs to
* @param {object} ballotId - ballotId to check
******/
let _getVote = (contractId, ballotId) => {
  if (Session.get('rightToVote') == false && Session.get('contract').stage != STAGE_DRAFT) {
    //check if user already voted
    var ledger = Session.get('contract').wallet.ledger
    for (i in ledger) {
      if (ledger[i].entityId == Meteor.user()._id) {
        ballot = ledger[i].ballot;
        for (k in ballot) {
          if (ballot[k]._id == ballotId) {
            return true;
          }
        }
      }
    }
    return false;
  } else {
    //check user current vote
    var votes = Session.get('candidateBallot');
    for (i in votes) {
      if (votes[i].contractId == contractId && votes[i].ballot._id == ballotId) {
        return votes[i].ballot.tick;
      }
    }
  }
}

/****
* checks if at least one item from ballot has been checked for voting
****/
let _ballotReady = () => {
  var votes = Session.get('candidateBallot');
  for (i in votes) {
    if (votes[i].ballot.tick == true) {
      return true;
    }
  }
  return false;
}


/****
* keeps only boolean true values in ballot
* @param {object} ballot - ballot object
* @return {object} options - array with only ticked true ballot options
****/
let _purgeBallot = (options) => {
  var finalBallot = new Array();
  for (i in options) {
    if (options[i].ballot.tick == true) {
      finalBallot.push(options[i].ballot);
    }
  }
  return finalBallot;
}

/******
* shows the results of the current poll
* @param {object} contract - contract to check results on
* @return {array} results - array with a statistical object for every item in the ballot
*******/
let _showResults = (contract) => {
  var results = new Array();
  var ledger = contract.wallet.ledger;
  var ballot = contract.ballot;

  //add votes
  for (i in ledger) {
    if (ledger[i].ballot != undefined && ledger[i].ballot.length > 0) {
      quantity = (ledger[i].quantity / ledger[i].ballot.length);
      for (k in ledger[i].ballot) {
        results = _countVotes(results, ledger[i].ballot[k], quantity);
      }
    }
  }

  //get stats
  var totalvotes = 0;
  for (i in results) {
    totalvotes += results[i].votes;
  }

  //set percentage
  for (i in results) {
    ballotcount = results[i];
    ballotcount['percentage'] = ((ballotcount.votes * 100) / totalvotes);
    results[i] = ballotcount;
  }

  console.log(contract.executionStatus);

  return results;
}

/******
* updates contract execution status based on final results
* @param {object} contract - contract to check results on
* @param {object} results - object with poll results
*********/
let _updateExecutionStatus = (contract, results) => {
  //check result
  var topvotes = 0;
  for (i in results) {
    if (results[i].votes > topvotes) {
      topvotes = results[i].votes;
      winner = results[i].mode;
    }
  }
  if (topvotes == 0) {
    winner = BALLOT_OPTION_MODE_NONE;
  }
  if (contract.stage == STAGE_LIVE) {
    var contractId = contract._id;
    switch (winner) {
      case BALLOT_OPTION_MODE_AUTHORIZE:
        Contracts.update({ _id: contractId }, { $set: { executionStatus: EXECUTION_STATUS_APPROVED, stage : STAGE_FINISH }});
        break;
      case BALLOT_OPTION_MODE_REJECT:
        Contracts.update({ _id: contractId }, { $set: { executionStatus: EXECUTION_STATUS_REJECTED, stage : STAGE_FINISH }});
        break;
      case BALLOT_OPTION_MODE_FORK:
        Contracts.update({ _id: contractId }, { $set: { executionStatus: EXECUTION_STATUS_ALTERNATIVE, stage : STAGE_FINISH }});
        break;
      default:
        Contracts.update({ _id: contractId }, { $set: { executionStatus: EXECUTION_STATUS_VOID, stage : STAGE_FINISH }});
    }
  }
}

/******
* counts the votes in a given ballot
* @param {array} scoreboard - array with all ballots to do counting on
* @param {ballot} ballot - ballot to which compare existence in scoreboard
* @param {number} quantity - amount of votes to add
* @return {array} scoreboard - result board
*******/
let _countVotes = (scoreboard, ballot, quantity) => {
  for (i in scoreboard) {
    if (scoreboard[i]._id == ballot._id) {
      //add votes to exsting item
      scoreboard[i].votes += quantity;
      return scoreboard;
    }
  }
  //new item in ballot
  ballot['votes'] = quantity;
  scoreboard.push(ballot);
  return scoreboard;
}


//adds a new proposal to contract being edited
let addNewProposal = () => {
  if (Session.get('proposalURLStatus') == 'AVAILABLE') {
    Meteor.call("createNewContract", Session.get('newProposal'), function (error, data) {
      if (error && error.error == 'duplicate-fork') {
        Session.set('duplicateFork', true)
      } else {
        Meteor.call("addCustomForkToContract", Session.get('contract')._id, data, function (error) {
          if (error && error.error == 'duplicate-fork') {
            Session.set('duplicateFork', true)
          } else {
            Session.set('dbContractBallot', Contracts.findOne( { _id: Session.get('contract')._id }, {reactive: false}).ballot );
            ProposalSearch.search('');
            document.getElementById("searchInput").innerHTML = '';
            Session.set('proposalURLStatus', 'UNAVAILABLE');
            Session.set('createProposal', false);
            Session.set('emptyBallot', false);
          }
        });
      }
    });
  }
}

/******
* updates the ranking of an option in a ballot
* @param {string} contractId - contract
* @param {array} sortedBallotIDs - available options in this ballot
*******/
let _updateBallotRank = (contractId, sortedBallotIDs) => {
  var contract = Contracts.findOne({ _id: contractId });
  var ballot = contract.ballot;
  for (i in sortedBallotIDs) {
    for (k in ballot) {
      if (ballot[k]._id == sortedBallotIDs[i]) {
        ballot[k].rank = parseInt(i) + 1;
        break;
      }
    }
  }
  contract.ballot = ballot;
  Contracts.update({ _id: contractId }, { $set: { ballot: contract.ballot } });
}

/******
* removes an option froim a ballot
* @param {string} contractId - contract
* @param {string} forkId - choice id
*******/
let _removeFork = (contractId, forkId) => {
  Contracts.update({ _id: contractId}, { $pull: {
    ballot:
      { _id: forkId}
  }})
};

Modules.client.removeFork = _removeFork;
Modules.client.updateBallotRank = _updateBallotRank;
Modules.client.updateExecutionStatus = _updateExecutionStatus;
Modules.client.showResults = _showResults;
Modules.client.purgeBallot = _purgeBallot;
Modules.client.ballotReady = _ballotReady;
Modules.client.forkContract = addNewProposal;
Modules.client.setVote = _setVote;
Modules.client.getVote = _getVote;
