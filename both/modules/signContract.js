let sign = (contractId, userObject, role) => {

  Contracts.update({_id: contractId}, { $push: {
    signatures:
      {
        _id: userObject._id,
        role: role,
        hash: '', //TODO implement PGP signature
        picture: userObject.profile.picture,
        firstName: userObject.profile.firstName,
        lastName: userObject.profile.lastName,
        country: userObject.profile.country
      }
  }});

};

Modules.both.signContract = sign;
