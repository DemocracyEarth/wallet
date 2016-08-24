import {default as Modules} from "./_modules";

/*****
/* @param
******/
let addEvent = (contractId, eventObject) => {

  Contracts.update(contractId, { $push: {
    events: eventObject
  }});

}


Modules.client.addEvent = addEvent;
