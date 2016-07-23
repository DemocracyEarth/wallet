import {default as Modules} from "./_modules";

/**
 * Changes the stage of a contract
 * @param {String} contractId that points to contract in db
 * @param {String} ['DRAFT', 'LIVE', 'FINISH']
 * @returns {Boolean}
 */

let contractStage = (contractId, stage) => {

  //TODO changes the stage of a contract.

};

Modules.both.setContractStage = contractStage;
