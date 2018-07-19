## User journey from the POV of COG feature
- [ ] Registering and login
  - [ ] With Metamask
    - [ ] Fetch ERC20 balances
    - [ ] Display tokens I have a stake in on my profile
    > At this stage I'm wondering if we should just use this balance to validate if the user has the right to vote on token related topics (constituency). **I'm using this hypotesis for now as its way easier to operate.**

  - [ ] Receiving $VOTEs upon account creation
  > The user registering with Metamask is still a normal user, so it should get its $VOTEs allocation either way.

  - [ ] Edit account information
  > When the user logs in with Metamask we don't get its email. In the edit profile modal we should the email field. If we want to keep the confirm your email loop we can send a new email every time it's changed.

  - [ ] Logout

- [ ] Exposing proposals
  - [ ] Expose proposals linked to $ticker (/token)
  > We should be thinking of how the user finds proposals related to the tokens he has stakes in. There are a few ways we could tackle this:
  - Tokens I have a stake in are displayed on my profile page, clicking on the token could take the user to a feed displaying proposal only availbale to vote for this token holder.
  - Use the $ticker (/token) filtering option available on Sovereign and use it as an input to define who is authorized to vote. If there are 2 $tickers in one proposal we could assume that both constituencies can vote ? Could be nice to allow comma seperated values for the consituency fields restricting the voters' unviverse.
  - Display in the $ticker feed all proposal that inputed a token name in the constituency modal.

- [ ] Authoring
    - [ ] Proposal with constituency (wip)
      - [ ] Fill Token holders field
      >
      - To avoid confusion we should only accept tickers. Would be nice to diplay a list of possible values that is reactive to what the user tipes in (like the nationality field, we could even have the token logos)
      - Allow for comma seperated values

    - [ ] Proposal with $ticker
    > When drafting a proposal and including a $ticker, the constituency option gets activated and the field token holder get filled with the $ticker value.

- [ ] Voting and revoking
    - [ ] Allocate n votes on proposal
    > When a user tries to allocate $VOTE on a $ticker related proposal Sovereign verifies that this token is listed in the user's profile and that it's most updated balance in that token is > 0. If conditions are not met show error message "You cannot vote on this proposal because you are not a token holder".

    - [ ] Withdraw n votes on proposal
- [ ] Delegating
    - [ ] Send n votes to another user
    - [ ] Remove n votes given to delegate
    - [ ] Show delegates on sidebar menu
