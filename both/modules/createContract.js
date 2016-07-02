let newDraft = () => {
  /*Meteor.call('createNewContract', 'New', function(error, result) {
    console.log('created new contract: ' + result + error);
  });*/
  Router.go('/vote/draft');

}

Modules.both.createContract = newDraft;
