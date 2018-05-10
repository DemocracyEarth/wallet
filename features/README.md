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

## Roadmap

- [x] Exposing issues
- [ ] Authoring
    - [x] Simple Ideas (twister-like)
    - [ ] Ideas with ballots
- [ ] Voting
    - [ ] Receiving votes upon account creation
    - [ ] Using votes on ideas
- [ ] Debating
    - [ ] Using a chronological tree
- [ ] Delegating
    - [ ] Giving votes to another citizen


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

