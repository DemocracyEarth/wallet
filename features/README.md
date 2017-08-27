This is an experimental feature suite in Gherkin, to write Specifications by Example.
It's a work in progress, and there's a lot of work ahead. Write a feature, and dive in !

Ideally running the feature suite should not ruin the dev database, (unless we want it to)
and it should be done using a meteor command such as test-features.

## WARNING

Running the feature suite will TRUNCATE THE DATABASE before each Scenario.
You will lose everything you had on the development server.
At the end of the test suite, the very last Scenario is not cleared,
so we can use that to create a fixtures Scenario to bootstrap local development.

## Roadmap

- [x] Authoring
    - [x] Ideas without ballots
    - [x] Ideas with ballots
- [ ] Voting
    - [x] Receiving votes upon account creation
    - [ ] Using votes on ideas
- [ ] Delegating
- [ ] Debating
    - [ ] Using a chronological tree

## Run

Launch the development server :

    $ meteor npm run start:dev

Then, in another terminal, run :

    $ chimp --chai --ddp=http://localhost:3000


## Assert

Assertions are done using [Chai](http://chaijs.com/).
Basically we're throwing errors when something goes awry or against expectations.


## Transformers

Some step variables (integers and floats) will be automatically parsed from the gherkin strings,
and provided to the step definition as variables of the correct type, eg: `1000` instead of `'1000'`.

This is a local (understand: _not a maintained third-party library_)
and somewhat fragile feature with too much voodoo and evil, but it seems to work.
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
The features will not like it, as they will try to fetch the logged in user defined from previous steps.

