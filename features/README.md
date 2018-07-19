Sovereign has a feature suite in [Gherkin](https://cucumber.io/docs/reference),
to write [Specifications by Example](https://en.wikipedia.org/wiki/Specification_by_example).
It's a work in progress, and there's a lot of work ahead. Write a feature, and dive in !

``` gherkin
Feature: Writing gherkin scenarios
In order to describe the feature I want
As a contributor
I want to be able to write scenarios and steps

Feature: Running gherkin scenarios
In order to develop quickly and fearlessly
As a developer
I want to be able to run the feature suite
```

## Glossary
| Term  | Meaning   |
|---|---|
| guest  | a person who uses the app without login in |
| user  | a person who uses the app, has been registered and is loggued in  |
| delegate | a user who sent with whom I exchanged tokens (received or sent)  |
| proposal | a text that raises a question, describes an idea or makes a statement, if activated users can vote and stake on the is votable, it can contain #hashtags and $tickers |
| #hashtag | short identifier of kind of content in the proposal, it starts with #, on click the user is exposed to all proposals linked to the hashtag |
| $ticker (wip)  | short identifier signaling that the proposal is linked to a token (crypto currency), it starts with $, on click the user is exposed to all proposals linked to the hashtag|
| constituency (wip) | defines who can vote on a proposal, there are 3 types : token (owns token), domain (registration email), nation (choosen nationality) |
| vote  | user chooses to allocate a number of tokens to a choice on a proposal |
| single vote  | user allocates one vote to a proposal |
| unvote  | user chooses to withdraw a number of tokens to a choice on a proposal  |
| delegate  | user chooses to send tokens to a another user which becomes a delegate |
| revoke  | user chooses to retrieve the tokens he previously sent to its delegate |
| stake (wip)| user votes on $token related proposal according to its stake in the currency |

To do
- [ ] enforce glossary on product inventory
- [ ] enforce glossary in existing `.feature` files.

## Product inventory
Checked items have been described into a `.feature` file and are covered by tests.

- [ ] Registering and login
  - [x] with email / password
  - [ ] with Facebook
  - [ ] with Blockstack
  - [ ] with Metamask
    - [ ] fetch ERC20 balance (wip)
  - [ ] Receiving votes upon account creation
  - [x] Edit account information
  - [ ] Logout
- [ ] Exposing proposals
  - [ ] Expose all proposals
  - [ ] Expose proposals linked to a nation (/geo)
  - [ ] Expose proposals linked to #hashtag (/tag)
  - [ ] Expose proposals linked to $ticker (/token)
  - [ ] Expose proposals linked to a user (/peer)
- [ ] Display users who a recent activity on the platform in the sidebar menu
- [ ] Exposing voting and delegationg activity
  - [ ] Initial token grant upon registration
  - [ ] Vote allocation on proposal
  - [ ] Vote removal from proposal
  - [ ] Modify vote allocation on proposal
  - [ ] Delegated votes from one user to a delegate
  - [ ] Removed delegated votes from a delegate
  - [ ] On general feed
  - [ ] On peer feed
- [ ] Authoring
    - [x] Proposal (single vote)
      - [ ] Nested proposal (debate)
    - [ ] Proposal with ballot
    - [ ] Proposal with staking (wip)
    - [ ] Proposal with ballot and staking (wip)
    - [ ] Proposal with constituency (wip)
    - [ ] Proposal with #hashtag
    - [ ] Proposal with $ticker
- [ ] Voting and revoking
    - [ ] Allocate n votes on proposal
    - [ ] Withdraw n votes on proposal
- [ ] Delegating
    - [ ] Send n votes to another user
    - [ ] Remove n votes given to delegate
    - [ ] Show delegates on sidebar menu

To do
- [ ] udate `login.feature` with token grant and logout

## How to Run

Launch the development server, in test mode :

    $ meteor npm run start:features

Then, _in another shell,_ run :

    $ meteor npm run test:features

**If you are sensitive to epilepsy, you should take the necessary precautions.**

To run a specific feature or scenario, tag it with `@watch` and run chimp with `--watch`.


## Assertions

Assertions are done using [Chai](http://chaijs.com/).
Basically we're throwing errors when something goes awry or against expectations.

``` js
expect(user.profile.wallet.available).to.equal(expectedVotesAvailable);
```


## Scenario-scoped context

Inside your step definitions, you may use the global object `context`, which is emptied before each scenario.
It is useful to store state between steps, for example `I`, which is defined at one step and used at another.


## Pitfalls

### Access Meteor from a step definition

Tests that run in the Chimp context do not run in Meteor,
they run outside Meteor and talk to the app, from a completely different node.js process.
Hence, the following imports won't work :

    import { Meteor } from 'meteor/meteor';
    import { Tags } from '/imports/api/tags/Tags';

You can still access them in `getServer.execute()`,
where `Meteor` will be defined, and you can use `require` to load the `Tags`.

### Naming a user 'I'

**Don't.**
The feature suite uses 'I' internally and will first try to fetch the logged in user defined from previous steps.

### Transformers

Transformers are useful to keep the step definitions dry.

Sadly, we don't use [transformers](https://github.com/cucumber/cucumber/wiki/Step-Argument-Transforms).
Chimp does not natively support them, and each of our implementation attempts had severe drawbacks.
Use the `castNum` and `getUser` functions in your steps to grab numbers and users from their string counterparts.

When Chimp supports them or you figure out a bug-free way to have them, please open an issue or a PR!
