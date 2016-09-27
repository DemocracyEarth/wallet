import {default as Modules} from "./_modules";

/*****
* @param {string} contractId - contract where this ballot belongs to
* @param {object} ballot - ballot object
******/
let setVote = (contractId, ballot) => {
  var candidateBallot = new Array();

  //see candidate ballots
  if (Session.get('candidateBallot') != undefined) {
   candidateBallot = Session.get('candidateBallot');
  }

  console.log(ballot._id);

  //add or update ballot in memory
  var update = false;
  for (i in candidateBallot) {
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

}

let getVote = (contractId, ballotOption) => {
  for (var i = 0; i < Session.get('candidateBallot').length; i++) {
    if (Session.get('candidateBallot')[i].contractId == contractId) {
      if (Session.get('candidateBallot')[i].ballotOption == ballotOption) {
         return Session.get('candidateBallot')[i].ticked;
      }
    }
  }
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

Modules.client.forkContract = addNewProposal;
Modules.client.setVoteBallot = setVote;
Modules.client.getVoteBallot = getVote;
