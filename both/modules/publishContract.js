let publish = (contractId) => {

  //Contracts.remove({_id: contractId});
  Contracts.update({ _id: contractId }, { $set: { stage: 'LIVE' } })

  console.log('contract published');

};

Modules.both.publishContract = publish;
