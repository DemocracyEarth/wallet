let sign = (contractId, userId, role) => {

  console.log('signing contract');

  Contracts.update({_id: contractId}, { $push: {
    signatures:
      {
        _id: userId,
        role: role,
        hash: ''
      }
  }});

};

Modules.both.signContract = sign;
