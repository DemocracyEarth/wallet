import {default as Modules} from "./_modules";

/*****
/* @param {string} arrBallot - array with values for ballot
******/
let setVote = (contractId, ballotOption, ticked) => {
  var potentialVote = new Array();

  if (Session.get('potentialVote') != undefined) {
   potentialVote = Session.get('potentialVote');
  }

  potentialVote.push({
      contractId: contractId,
      ballotOption: ballotOption,
      ticked: ticked
   });

  Session.set('potentialVote', potentialVote);

}

let getVote = (contractId, ballotOption) => {
  for (var i = 0; i < Session.get('potentialVote').length; i++) {
    if (Session.get('potentialVote')[i].contractId == contractId) {
      if (Session.get('potentialVote')[i].ballotOption == ballotOption) {
         return Session.get('potentialVote')[i].ticked;
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
            Session.set('dbContractBallot', Contracts.findOne( { _id: Session.get('contractId') }, {reactive: false}).ballot );
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
