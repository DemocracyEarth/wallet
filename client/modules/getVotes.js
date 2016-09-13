import {default as Modules} from "./_modules";

/*****
/* decides wether to get vots from a user on DB or from current active sessions of user
/* @param {string} userId - user ID
/* @param {string} sessionVar - session variable for interface purposes
/* @return {number} value - quantity of votes
******/
let _getWalletVotes = (userId, sessionVar) => {
  if (userId != Meteor.userId()) {
    Meteor.call('getUserInfo', userId, function (error, data) {
      if (error)
        console.log(error);

      return _setVote(data.profile.wallet, sessionVar);
    });
  } else {
    if (Meteor.user().profile.wallet != undefined) {
      return _setVote(Meteor.user().profile.wallet, sessionVar);
    } else {
      return 0;
    }
  }
}


/*****
/* returns specific quantity of votes from a wallet and sets a session variable
/* @param {object} wallet - wallet object containing vote balance
/* @param {string} sessionVar - a session variable to be used for UX and specifying vote value
/* @return {number} value - quantity of votes
******/
let _setVote = (wallet, sessionVar) => {
  if (wallet != undefined) {
    switch(sessionVar) {
      case 'availableVotes':
        value = wallet.available;
        break;
      case 'placedVotes':
        value = wallet.placed;
        break;
    }
    Session.set(sessionVar, value);
    return value;
  }
}

Modules.client.getWalletVotes = _getWalletVotes;
