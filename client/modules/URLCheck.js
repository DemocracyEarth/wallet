import {default as Modules} from "./_modules";

let URLStatus = (sessionVar) => {
  switch (Session.get(sessionVar)) {
    case "VERIFY":
      return TAPi18n.__('url-verify');
      break;
    case "UNAVAILABLE":
      return TAPi18n.__('url-unavailable');
      break;
    case "AVAILABLE":
      return TAPi18n.__('url-available');
      break;
  }
};

let verifierMode = (sessionVar) => {
  switch (Session.get(sessionVar)) {
    case "VERIFY":
      animate($('.state'), 'tilt', { loop: true, duration: 750 });
      return 'verifying';
      break;
    case "UNAVAILABLE":
      animate($('.state'), 'fade-in');
      return 'unavailable';
      break;
    case "AVAILABLE":
      animate($('.state'), 'fade-in');
      return 'available';
      break;
    default:
      return 'hide';
  }
};


Modules.client.URLCheck = URLStatus;
Modules.client.URLVerifier = verifierMode;
