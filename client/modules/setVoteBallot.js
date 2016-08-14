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

Modules.client.setVoteBallot = setVote;
Modules.client.getVoteBallot = getVote;
