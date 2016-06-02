let validateEmail = (email) => {
  var val = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  //TODO verify if email already exists in db

  Session.set("invalidEmail", !val.test(email));
  return val.test(email);
}

Modules.both.validateEmail = validateEmail;
