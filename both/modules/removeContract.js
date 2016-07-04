let remove = (contractId) => {

  Contracts.remove({_id: contractId});

};

Modules.both.removeContract = remove;
