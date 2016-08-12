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

let getVote = () => {


}

Modules.client.setVoteBallot = setVote;
Modules.client.getVoteBallot = getVote;
