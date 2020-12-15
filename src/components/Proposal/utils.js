// COMPOSE PROPOSAL
export const composeProposal = async (
  /* Contract */ contract,
  version,
  /* Proposal arguments */ applicant,
  sharesRequested,
  lootRequested,
  tributeOffered,
  tributeToken,
  paymentRequested,
  paymentToken,
  details
) => {
  if (version === "1")
    return await contract.methods.submitProposal(
      applicant,
      tributeToken,
      sharesRequested,
      `{"title":${details.title},"description":${details.description},"link":${details.link}}`
    );
  if (version === "2")
    return await contract.methods.submitProposal(
      applicant,
      sharesRequested,
      lootRequested,
      tributeOffered,
      tributeToken,
      paymentRequested,
      paymentToken,
      details
    );

  return false;
};
