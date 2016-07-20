let publish = (contractId) => {

  //Contracts.remove({_id: contractId});
  Contracts.update({ _id: contractId }, { $set: { stage: 'LIVE' } })

  Router.go('/');

  //TODO security checks of all kinds, i know, i know.

};

Modules.both.publishContract = publish;
