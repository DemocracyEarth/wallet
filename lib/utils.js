//Global Methods

//Returns current app language
getUserLanguage = function () {
  // Put here the logic for determining the user language
  return $LANGUAGE;
};

//Saves text description on db
saveDescription = function (newHTML) {
  if (newHTML != getContract().description) {
    //Meteor.call("updateContractField", getContract()._id, "description", newHTML);
    Contracts.update(Session.get('contractId'), { $set: { description: newHTML} });
    console.log('[description] saved HTML changes');
  }
}

//Gets current contract info
getContract = function (contractId) {
  //console.log('contract id is ' + Session.get('voteKeyword'));
  if (contractId != undefined ) {
    return Contracts.findOne( { _id: contractId } );
  } else {
    if (Session.get('contractId') != undefined) {
      return Contracts.findOne( { _id: Session.get('contractId') } );
    } else if (Session.get('voteKeyword') != undefined) {
      var contract = Contracts.findOne( { keyword: Session.get('voteKeyword') } );
      Session.set('contractId', contract._id);
      return contract;
    }
  }
}

//Decides if it should hide or not a DOM element
displayElement = function (sessionVar) {
  if (Session.get(sessionVar)) {
    return '';
  } else {
    return 'display:none';
  }
}

//Displays a warning for a limited period.
displayTimedWarning = function (warning) {
  if (Session.get(warning)) {
    Meteor.setTimeout(function () {Session.set(warning, false)}, 5000);
  }
  return Session.get(warning);
}

//Contract constructor.
contract = function (title, description, tags) {
  this.title = title;
  this.description = description;
  this.tags = tags;
}

//converts a String to slug-like-text.
convertToSlug = function (text) {
  var result = new String();
  if (text != undefined) {
    return result
        .toLowerCase()
        .replace(/ /g,'-')
        .replace(/[^\w-]+/g,'')
        ;
  }
}

//verifies the existence of duplicates in array list
checkDuplicate = function (arr, elementId) {
  for (var i = 0; i < arr.length; i++ ) {
    if (arr[i]._id == elementId ) {
      return true;
    }
  }
  return false;
}
