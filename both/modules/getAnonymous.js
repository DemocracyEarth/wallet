import {default as Modules} from "./_modules";

let _getAnonObject = () => {

  return {
  "_id" : "0000000",
  "role" : "AUTHOR",
  "hash" : "",
  "picture" : "/images/anonymous.png",
  "firstName" : TAPi18n.__('anonymous'),
  "lastName" : "",
  "country" :
    {
      "code" : "",
      "name" : TAPi18n.__('unknown')
    }
  };
}

Modules.both.getAnonymous = _getAnonObject;
