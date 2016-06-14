let getName = (firstName, lastName) => {

  var completeName = firstName + ' ' + lastName;
  if (completeName.length > MAX_PROFILE_NAME_LENGTH) {
    completeName = completeName.slice(0, parseInt(0 + (MAX_PROFILE_NAME_LENGTH - completeName.length))) + '...';
  }
  return completeName;

}

Modules.client.showFullName = getName;
