/* IMPORTS */
// Components
import logo from 'images/logo.png';
import i18n from 'i18n';
// Functions
import { walletError, notMember} from "components/Choice/messages";

const Web3 = require("web3");

// UX utils
export const hideProposalLauncher = () => {
  window.showProposalLauncher.value = false;
}

export const showProposalLauncher = (address) => {
  window.proposalLauncher = {
    address
  }
  window.showProposalLauncher.value = true;
}

const showModal = () => {
  window.modal = {
      icon: logo,
      title: i18n.t('Proposal submitted'),
      message: i18n.t('Your proposal was successfully submitted'),
      cancelLabel: i18n.t('close'),
      mode: 'ALERT'
  }
  window.showModal.value = true;
}

// Validation utils
export const isAddress = async (
  address,
) => {
  const web3 = await new Web3(window.web3.currentProvider);
  return await web3.utils.isAddress(address)
}

export const isMember = async (
  memberAddress,
  /*Contract information*/
  library,
  version,
  contractAddress
) => {
  const web3 = await new Web3(window.web3.currentProvider);

  const isAddress = await web3.utils.isAddress(memberAddress)
  if (!isAddress) return false
  
  const dao = await new web3.eth.Contract(
      library[version === "2" ? "moloch2" : "moloch"],
      contractAddress
  );
  
  const response = await dao.methods.members(web3.utils.toChecksumAddress(memberAddress))
      .call({}, (err, res) => {
          if (err) {
              walletError(err);
              return err;
          }
          return res;
      });
  return response.exists;
};

export const notNull = ( ...args ) => {
  let validated = true
  args.forEach(a => {if(a === "0x0" || a === '') validated = false})
  return validated
}

// Submitting utils
const getDao = async (library, version, address) => {
  const web3 = new Web3(window.web3.currentProvider);
  const dao = await new web3.eth.Contract(
    library[version === "2" ? "moloch2" : "moloch"],
    address
  )
  return dao
}

const getEstimatedGas = async (proposal) => {
  let gas
  try{
      gas = await proposal.estimateGas().then(gas=> gas)
  } catch (err){
      console.log('ERROR: ', err)
  }
  return gas
} 

const getReceipt = async (proposal, user, estimatedGas) => {
  let receipt
  try{
      receipt = await proposal.send({ from: user, gas: estimatedGas })
      .on('receipt', receipt => { showModal(); console.log('RECEIPT: ', receipt); return receipt })
  } catch (err) {
      walletError(err);
      receipt = err;
  }
  return receipt
}

// Submitting functions
export const submitProposal = async (
  /*Wallet information*/
  user,
  /*Contract information*/
  library,
  version,
  address,
  /*Proposal information*/
  applicantAddress,
  sharesRequested,
  lootRequested,
  tributeOffered,
  tributeToken,
  paymentRequested,
  paymentToken,
  details
) => {
  console.log('SUBMITTING NEW PROPOSAL...')
  const dao = await getDao(library, version, address);

  // dao membership
  if (version === "1" && !(await isMember(user, library, version, address))) {
      return notMember();
  }

  const proposal = version === "2"
      ? await dao.methods.submitProposal(
          applicantAddress,
          sharesRequested,
          lootRequested,
          tributeOffered,
          tributeToken,
          paymentRequested,
          paymentToken,
          details
      )
      : await dao.methods.submitProposal(
          applicantAddress,
          tributeToken,
          sharesRequested,
          `{"title":${details.title.valu},"description":${details.description},"link":${details.link}}`
      );
  const estimatedGas = await getEstimatedGas(proposal)
  const receipt =  await getReceipt(proposal, user, estimatedGas)
  return receipt
};

export const submitWhitelistProposal = async (
  /*Wallet information*/
  user,
  /*Contract information*/
  library,
  version,
  address,
  /*Proposal information*/
  tokenToWhitelist,
  details
) => {
  console.log('SUBMITTING NEW WHITELIST PROPOSAL...')
  const dao = await getDao(library, version, address);
  const proposal = await dao.methods.submitWhitelistProposal(
      tokenToWhitelist,
      details
  );
  const estimatedGas = await getEstimatedGas(proposal)
  const receipt =  await getReceipt(proposal, user, estimatedGas)
  return receipt
};

export const submitGuildKickProposal = async (
  /*Wallet information*/
  user,
  /*Contract information*/
  library,
  version,
  address,
  /*Proposal information*/
  memberToKick,
  details
) => {
  console.log('SUBMITTING NEW GUILD KICK PROPOSAL...')
  const dao = await getDao(library, version, address);
  const proposal = await dao.methods.submitGuildKickProposal(
      memberToKick,
      details
  );
  const estimatedGas = await getEstimatedGas(proposal)
  const receipt =  await getReceipt(proposal, user, estimatedGas)
  return receipt
};