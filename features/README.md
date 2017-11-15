This is an experimental feature suite in [Gherkin](https://cucumber.io/docs/reference),
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

Ideally running the feature suite should not ruin the dev database, _(unless we want it to)_
and it should be done using a meteor command such as `test-features`.


## WARNING

Running the feature suite will TRUNCATE THE DATABASE before each Scenario.
You will lose everything on your development environment database.
At the end of the test suite, the very last Scenario is not cleared,
so we can use that to create a fixtures Scenario to bootstrap local development.


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

Launch the development server :

    $ meteor npm run start:dev

Then, _in another shell,_ run :

    $ chimp --chai --ddp=http://localhost:3000


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

### Cannot find module 'chai-string'

    $ npm install --save-dev chai-string

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

