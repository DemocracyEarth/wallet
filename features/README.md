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
You will lose everything you had on the development server.
At the end of the test suite, the very last Scenario is not cleared,
so we can use that to create a fixtures Scenario to bootstrap local development.


## Roadmap

- Authoring
    - [x] Ideas without ballots
    - [x] Ideas with ballots
- Voting
    - [x] Receiving votes upon account creation
    - [ ] Using votes on ideas
- Delegating
    - [ ] Giving votes to another citizen
- Debating
    - [ ] Using a chronological tree


## Run

Launch the development server :

    $ meteor npm run start:dev

Then, _in another terminal,_ run :

    $ chimp --chai --ddp=http://localhost:3000


## Assert

Assertions are done using [Chai](http://chaijs.com/).
Basically we're throwing errors when something goes awry or against expectations.

``` js
expect(user.profile.wallet.available).to.equal(expectedVotesAvailable);
```


## Transformers

Some step variables (integers and floats) will be automatically parsed from the gherkin strings,
and provided to the step definition as variables of the correct type, eg: `1000` instead of `'1000'`.

Transformers dry up the step definitions by removing the usage of `parseInt`, `parseFloat`, etc.

This is a local (understand: _not a maintained third-party library_)
and somewhat fragile feature with too much evil voodoo, but it seems to work.
Tread carefully.


## Pitfalls

### Cannot find module 'chai-string'

    $ npm install --save-dev chai-string

### Access Meteor from a step definition

Tests that run in the Chimp context do not run in Meteor,
they run outside Meteor and talk to the app, from a completely different node.js process.
Hence, the following imports won't work but you can still access them in `server.execute()` :

    import { Meteor } from 'meteor/meteor';
    import { Tags } from '/imports/api/tags/Tags';

See `setup-steps.js` for an example.

### Naming a user 'I'

**Don't.**
The features will first try to fetch the logged in user defined from previous steps.

