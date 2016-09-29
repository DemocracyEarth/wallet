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
* @return {array} results - array with a statistical object for every item in the ballot
*******/
let _showResults = () => {
  var results = new Array();
  var ledger = Session.get('contract').wallet.ledger;
  var ballot = Session.get('contract').ballot;

  //add votes
  for (i in ledger) {
    if (ledger[i].ballot.length > 0) {
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

  return results;
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


//adds a new proposal to contrat being edited
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

Modules.client.showResults = _showResults;
Modules.client.purgeBallot = _purgeBallot;
Modules.client.ballotReady = _ballotReady;
Modules.client.forkContract = addNewProposal;
Modules.client.setVote = _setVote;
Modules.client.getVote = _getVote;
