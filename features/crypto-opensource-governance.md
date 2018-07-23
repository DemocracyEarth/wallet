## User journey from the POV of COG feature
- [ ] Registering and login
  - [ ] With Metamask
    - [ ] Fetch ERC20 balances
  - [ ] Receive 1000 $VOTEs upon account creation

- [ ] Display tokens associated with my balance
  - [ ] Show balance info (Total, % Cast, # Available)
  > ETH at first, then other ERC20 later on.

- [ ] Edit account information
  - [ ] Add first, last name
  - [ ] Add username
  - [ ] Upload avatar

- [ ] Logout

- [ ] Exposing proposals
  - [ ] Expose proposals linked to $ticker (/token)
  > We should be thinking of how the user finds proposals related to the tokens he has stakes in. There are a few ways we could tackle this: 1)Tokens I have a stake in are displayed on my profile page, clicking on the token could take the user to a feed displaying proposal only availbale to vote for this token holder. 2) Use the $ticker (/token) filtering option available on Sovereign and use it as an input to define who is authorized to vote. If there are 2 $tickers in one proposal we could assume that both constituencies can vote ? Could be nice to allow comma seperated values for the consituency fields restricting the voters' unviverse. 3) Display in the $ticker feed all proposal that inputed a token name in the constituency modal.

- [ ] Authoring
    - [ ] Proposal with constituency (wip)
      - [ ] Fill Token holders field
      > Allow for multiple values

    - [ ] Proposal with $ticker
    > When drafting a proposal and including a $ticker, the constituency option gets activated and the field token holder get filled with the $ticker value.

- [ ] Voting and revoking
    - [ ] Allocate % of stake on proposal
    - [ ] Withdraw % of stake on proposal

- [ ] Delegating
    - [ ] Send % of stake to another user
    > Should the user already have a balance for this token ?

    - [ ] Remove % of stake given to delegate
    - [ ] Show delegates on sidebar menu
