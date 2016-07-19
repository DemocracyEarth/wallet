let publish = (contractId) => {

  //Contracts.remove({_id: contractId});
  Contracts.update({ _id: contractid }, { $set: { stage: 'VOTE' } })

  console.log('contract published');

};

Modules.both.publishContract = publish;
